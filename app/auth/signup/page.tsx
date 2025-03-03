'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleSubmit } from './actions'; 

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    email?: null | string,
    firstname?: null | string,
    lastname?: null | string,
    password?: null | string,
  }>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string }  = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    if (!formData.firstname) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    if (!validate()) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form action={handleSubmit} onSubmit={handleClientSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
          />
          {errors.firstname && (
            <p style={{ color: 'red' }}>{errors.firstname}</p>
          )}
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
          />
          {errors.lastname && (
            <p style={{ color: 'red' }}>{errors.lastname}</p>
          )}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p style={{ color: 'red' }}>{errors.password}</p>
          )}
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;