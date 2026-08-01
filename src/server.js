import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server is running on ports http://localhost:${PORT} or http://127.0.0.1:${PORT}`
  );
});
