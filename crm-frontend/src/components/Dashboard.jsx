import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', region: '' });
  const [userId, setUserId] = useState(null);  // Store the logged-in user ID
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch logged-in user ID from local storage
    const loggedInUserId = localStorage.getItem('userId');  // Replace with your method of getting user ID
    setUserId(loggedInUserId);

    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customer/loggedIn');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');  // Clear the user ID on logout
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
      await api.delete(`/customer/delete/${id}`);
      setCustomers(customers.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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

      // Refetch customers to update the list
      const response = await api.get('/customer/loggedIn');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
};


  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-6 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
      >
        Logout
      </button>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">CRM Dashboard</h2>
      <button
        onClick={handleAddCustomer}
        className="mb-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
      >
        <FaPlus className="inline-block mr-2" /> Add Customer
      </button>
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">{editMode ? 'Edit Customer' : 'Add Customer'}</h3>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
            <input
              id="region"
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            {editMode ? 'Update' : 'Add'}
          </button>
        </form>
      )}
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
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{customer.firstName}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{customer.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{customer.email}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{customer.region}</td>
                <td className="px-6 py-4 text-sm text-gray-800 flex space-x-2">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-500 hover:text-red-600"
                  >
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
