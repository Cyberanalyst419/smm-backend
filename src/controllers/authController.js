const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase'); // unified client

// ✅ REGISTER
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // 1. Check if user already exists
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`);

    if (selectError) throw selectError;
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already taken.' });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // from query() style

    // 3. Insert user into Supabase
    const { data: newUserRow, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: hashedPassword, // keep Supabase column
          balance: 0.0,
          role: 'user'
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const newUser = {
      id: newUserRow.id,
      username: newUserRow.username,
      email: newUserRow.email
    };

    // 4. Create user profile
    const { error: profileError } = await supabase.from('user_profiles').insert([
      {
        user_id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: '',
        avatar: `https://i.pravatar.cc/150?u=${newUser.email}`,
        bio: '',
        status: 'active'
      }
    ]);
    if (profileError) throw profileError;

    // 5. Create wallet
    const { error: walletError } = await supabase.from('wallets').insert([
      {
        user_id: newUser.id,
        balance: 0.0,
        currency: 'USD'
      }
    ]);
    if (walletError) throw walletError;

    return res.status(201).json({ user: newUser, message: 'Registration successful.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Registration failed.',
      error: err.message
    });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password_hash); // query() style compare
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // richer payload
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Login failed.',
      error: err.message
    });
  }
};
