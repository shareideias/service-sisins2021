import request from 'supertest';
import app from '../app';
import { Connection, createConnection } from 'typeorm';
import { Participante } from '../models/Participante';

const populateDatabase = async (connection: Connection) => {
  const participanteRepository = connection.getRepository(Participante);
  const participante = participanteRepository.create({
    email: 'this_email_exists@example.com',
    senha: '$2b$10$c9v0imXbhfVuBgLfwaYSLubxb8.gpvr4MfX1ltmEDwIdh.x3ksj.y',
    cidade: 'Test',
    estado: 'Test',
    cpf: '12345678912',
    nascimento: new Date(1999, 2, 27),
    nome: 'Test',
    pais: 'Test',
    telefone: '1234',
  });
  await participanteRepository.save(participante);
};

describe('Authentication tests', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
  });

  it('Should return a token if the email and password sent are correct', async () => {
    const response = await request(app).post('/api/authenticate').send({
      email: 'this_email_exists@example.com',
      password: 'correct_password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('Should return 401 UNAUTHORIZED if the email does not exist', async () => {
    const response = await request(app).post('/api/authenticate').send({
      email: 'user@example.com',
      password: 'password',
    });

    expect(response.status).toBe(401);
  });

  it('Should return 401 UNAUTHORIZED if the email exists, but password is incorrect', async () => {
    const response = await request(app).post('/api/authenticate').send({
      email: 'this_email_exists@example.com',
      password: 'incorrect_password',
    });

    expect(response.status).toBe(401);
  });

  it('Should return 400 BAD REQUEST if no email or password is given', async () => {
    const responseWithoutEmail = await request(app)
      .post('/api/authenticate')
      .send({
        password: 'password',
      });
    const responseWithoutPassword = await request(app)
      .post('/api/authenticate')
      .send({
        email: 'user@example.com',
      });

    expect(responseWithoutEmail.status).toBe(400);
    expect(responseWithoutPassword.status).toBe(400);
  });
});