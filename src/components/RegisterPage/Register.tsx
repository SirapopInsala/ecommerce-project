"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
import fetchGraphQL from '@/utils/graphqlClient';

const Register = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '' });

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = { firstname: '', lastname: '', email: '', password: '', confirmPassword: '' };

    // Validation
    if (!firstname) validationErrors.firstname = "Please enter your first name.";
    if (!lastname) validationErrors.lastname = "Please enter your last name.";
    if (!email) validationErrors.email = "Please enter your email.";
    else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.email = "Please enter a valid email.";

    if (!password) validationErrors.password = "Please enter your password.";
    if (!confirmPassword) validationErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) validationErrors.confirmPassword = "Passwords don't match.";

    setErrors(validationErrors);

    if (Object.values(validationErrors).some((error) => error !== '')) {
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        mutation ($firstname: String!, $lastname: String!, $email: String!, $password: String!) {
          insert_users_one(object: {
            firstname: $firstname,
            lastname: $lastname,
            email: $email,
            password: $password
          }) {
            id
            email
          }
        }
      `;

      const variables = {
        firstname,
        lastname,
        email,
        password: hashedPassword,
      };

      await fetchGraphQL(query, variables);

      const confirmRedirect = window.confirm("Registration successful! Would you like to go to the login page?");
      if (confirmRedirect) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user.');
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url("/ecom-login-register.jpg")' }}></div>
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl text-black text-center font-bold mb-6">Create Account</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="First Name"
                className={`w-full p-2 border rounded-full text-black ${errors.firstname ? 'border-red-500' : ''}`}
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname}</p>}
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Last Name"
                className={`w-full p-2 border rounded-full text-black ${errors.lastname ? 'border-red-500' : ''}`}
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
              {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className={`w-full p-2 border rounded-full text-black ${errors.email ? 'border-red-500' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                className={`w-full p-2 border rounded-full text-black ${errors.password ? 'border-red-500' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Confirm Password"
                className={`w-full p-2 border rounded-full text-black ${errors.confirmPassword ? 'border-red-500' : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0">
              Create Account
            </button>
          </form>
          <p className="mt-4 text-center text-black">
            Already have an account? 
            <a href="/login" className="text-blue-500 font-semibold hover:text-blue-600 transition duration-300 ease-in-out ml-2">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
