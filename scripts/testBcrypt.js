const bcrypt = require('bcryptjs');

// Test básico de bcrypt
const testBcrypt = async () => {
  console.log('=== TEST DE BCRYPT ===');
  
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Contraseña:', password);
  console.log('Hash generado:', hash);
  console.log('Longitud hash:', hash.length);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verificación exitosa:', isValid);
};

testBcrypt();