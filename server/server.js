const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


app.options('*', cors())

// Middleware
app.use(cors({
  origin: 'http://pwa.jouquan.fr', // Remplace avec l'URL correcte de ton application Angular
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
})); // Accepte toutes les origines, ajuste cela en fonction de tes besoins en production*/
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('Backend for Messaging App');
});

// MongoDB connection
mongoose.connect('mongodb://0.0.0.0:27017/messagingApp', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected to the database!');
});

// Définition du schéma pour la collection "users"
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Inclus le champ _id dans le schéma
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String }, // Inclus le champ email dans le schéma
  contacts: { type: [String] }, // Inclus le champ email dans le schéma
  conversations: { type: [String] } // Inclus le champ email dans le schéma
}, { versionKey: false });
// Modèle MongoDB pour la collection "users"
const User = mongoose.model('users', userSchema);

const convSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  members: { type: [String], required: true },
  messages:  { type: [String], required: true }
}, { versionKey: false });
const Conv = mongoose.model('conversations', convSchema);

const msgSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  senderID: { type: String, required: true },
  content: { type: String },
  date: { type: String, required: true },
  convId: { type: String, required: true }
}, { versionKey: false });
const Msg = mongoose.model('messages', msgSchema);

const authSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  password: { type: String, required: true },
  userID: { type: String, required: true }
}, { versionKey: false });
const Auth = mongoose.model('auth', authSchema);

// Endpoint pour récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour ajouter un utilisateur
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    newUser._id = new mongoose.Types.ObjectId();
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour la connexion (login)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Vérifie les identifiants de l'utilisateur par exemple
    const user = await User.findOne({ username, password });

    if (user) {
      // Utilisateur authentifié
      res.json({ success: true, user });
    } else {
      // Identifiants incorrects
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Endpoint pour récupérer un utilisateur par son ID
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour récupérer une conv par son ID
app.get('/api/conversations/:id', async (req, res) =>
{
  const convId = req.params.id;
  try {
    const conv = await Conv.findById(convId);
    if (conv) {
      res.json(conv);
    } else {
      res.status(404).json({ error: 'Conversation non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour ajouter une conv
app.post('/api/conversations', async (req, res) => {
  try {
    const newConv = new Conv(req.body);
    newConv._id = new mongoose.Types.ObjectId();
    const savedConv = await newConv.save();
    res.json(savedConv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour récupérer un msg par son ID
app.get('/api/messages/:id', async (req, res) =>
{
  const msgId = req.params.id;
  try {
    const msg = await Msg.findById(msgId);
    if (msg) {
      res.json(msg);
    } else {
      res.status(404).json({ error: 'Message non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour ajouter un message
app.post('/api/messages', async (req, res) => {
  try {
    const newMsg = new Msg(req.body);
    newMsg._id = new mongoose.Types.ObjectId();
    const savedMsg = await newMsg.save();
    res.json(savedMsg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour mettre à jour un utilisateur par son ID
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'Utilisateur '+ userId + ' non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour mettre à jour un message par son ID
app.put('/api/messages/:id', async (req, res) => {
  const msgId = req.params.id;

  try {
    const updatedMsg = await Msg.findByIdAndUpdate(msgId, req.body, { new: true });

    if (updatedMsg) {
      res.json(updatedMsg);
    } else {
      res.status(404).json({ error: 'Utilisateur '+ msgId + ' non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour mettre à jour une conv par son ID
app.put('/api/conversations/:id', async (req, res) => {
  const convId = req.params.id;

  try {
    const updatedConv = await Conv.findByIdAndUpdate(convId, req.body, { new: true });

    if (updatedConv) {
      res.json(updatedConv);
    } else {
      res.status(404).json({ error: 'Utilisateur '+ convId + ' non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});



/*
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});*/
