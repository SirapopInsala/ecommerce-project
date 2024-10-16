"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import bcrypt from 'bcryptjs';
import fetchGraphQL from '@/utils/graphqlClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { setUser } = useAuth();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
          const query = `
            query ($email: String!) {
              users(where: { email: { _ilike: $email } }) {
                id
                firstname
                lastname
                password
              }
            }
          `;
    
          const variables = { email };
          const result = await fetchGraphQL(query, variables);

          const user = result.users[0];
          if (!user || !(await bcrypt.compare(password, user.password))) {
            alert('Invalid email or password.');
            return;
          }

          setUser({ 
            id: user.id,
            firstname: user.firstname, 
            lastname: user.lastname, 
            email: user.email 
          });
    
          router.push('/product_catalog');
        } catch (error) {
          console.error('Error logging in:', error);
          alert('Error logging in.');
        }
      };

    return (
        <div className="flex h-screen bg-white">
            <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url("/ecom-login-register.jpg")' }}></div>
            <div className="w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-6 text-black text-center">Login</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-2 border mb-4 rounded-full text-black"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-2 border mb-4 rounded-full text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0">
                          Login
                        </button>
                    </form>
                    <p className="mt-4 text-black text-center">
                      Don&apos;t have an account? 
                      <a href="/register" className="text-blue-500 font-semibold hover:text-blue-600 transition duration-300 ease-in-out ml-2">
                        Register here
                      </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
