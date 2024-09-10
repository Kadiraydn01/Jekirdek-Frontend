import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from './Modal';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', region: '' });
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('userId');
    setUserId(loggedInUserId);

    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customer/loggedIn');
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleAddCustomer = () => {
    setFormData({ firstName: '', lastName: '', email: '', region: '' });
    setEditMode(false);
    setShowForm(true);
  };

  const handleEditCustomer = (customer) => {
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      region: customer.region
    });
    setCurrentCustomer(customer);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.delete(`/customer/${id}`);
      setCustomers(customers.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(formData.firstName) || formData.firstName.length < 3 || formData.firstName.length > 16) {
      newErrors.firstName = 'First name must contain only letters, be at least 3 characters, and at most 16 characters.';
    }

    if (!nameRegex.test(formData.lastName) || formData.lastName.length < 3 || formData.lastName.length > 16) {
      newErrors.lastName = 'Last name must contain only letters, be at least 3 characters, and at most 16 characters.';
    }

    if (!nameRegex.test(formData.region) || formData.region.length < 3 || formData.region.length > 24) {
      newErrors.region = 'Region must contain only letters, be at least 3 characters, and at most 24 characters.';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }

    return newErrors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      const data = { 
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        region: formData.region,
        userId: parseInt(userId, 10)
      };

      if (editMode) {
        await api.put(`/customer/${currentCustomer.id}`, data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        await api.post('/customer/create', data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      setShowForm(false);
      setFormData({ firstName: '', lastName: '', email: '', region: '' });
      setErrors({}); // Clear errors on successful submission

      const response = await api.get('/customer/loggedIn');
      setCustomers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrors({ email: 'This email is already registered. Please use a different email.' });
      } else {
        console.error('Error submitting form:', error);
        alert("An error occurred while submitting the form. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={handleAddCustomer}
            className="mb-6 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
          >
            <FaPlus className="inline-block mr-2" /> Add Customer
          </button>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="absolute top-4 mb-6 right-6 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleFormSubmit}>
          <h3 className="text-xl font-semibold text-center mb-4">{editMode ? 'Edit Customer' : 'Add Customer'}</h3>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
            <input
              id="region"
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
            {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700"
          >
            {editMode ? 'Update' : 'Add'}
          </button>
        </form>
      </Modal>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">First Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Last Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Region</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-t border-gray-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.region}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                  <button onClick={() => handleEditCustomer(customer)} className="text-indigo-600 hover:text-indigo-900">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-600 hover:text-red-900">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
