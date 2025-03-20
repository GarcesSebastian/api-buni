export const GetUsers = async (req, res) => {
    try {
        const users = [
            {
              "id": 1,
              "name": "John Doe",
              "email": "johndoe@gmail.com",
              "password": "password123",
              "created_at": "2025-03-20T10:08:20.000Z"
            },
            {
              "id": 2,
              "name": "Jane Doe",
              "email": "janedoe@gmail.com",
              "password": "password456",
              "created_at": "2025-03-20T10:08:20.000Z"
            },
            {
              "id": 3,
              "name": "John Smith",
              "email": "johnsmith@gmail.com",
              "password": "password789",
              "created_at": "2025-03-20T10:08:20.000Z"
            },
            {
              "id": 4,
              "name": "Jane Smith",
              "email": "janesmith@gmail.com",
              "password": "password101112",
              "created_at": "2025-03-20T10:08:20.000Z"
            },
            {
              "id": 5,
              "name": "Sebxstt",
              "email": "Sebxstt@gmail.com",
              "password": "123",
              "created_at": "2025-03-20T10:12:35.000Z"
            }
        ]
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// export const CreateUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         if (!name || !email || !password) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
//         return res.status(201).json({ message: 'User created' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
