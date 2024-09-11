import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Modal from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    region: "",
  });
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  const [filterFirstName, setFilterFirstName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRegion, setFilterRegion] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUserId = localStorage.getItem("userId");
    setUserId(loggedInUserId);

    const fetchCustomers = async () => {
      try {
        const response = await api.get("/customer/loggedIn");
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);
  //filtreleme işlevi
  const handleFilter = async () => {
    try {
      const response = await api.get(`/customer/filter`, {
        params: {
          firstName: filterFirstName || undefined,
          email: filterEmail || undefined,
          region: filterRegion || undefined,
        },
      });
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error("Error filtering customers:", error);
    }
  };

  // Arama işlevi
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  //Çıkış işlevi
  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logout successful 🍀", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };
  //Müşteri ekleme işlevi
  const handleAddCustomer = () => {
    setFormData({ firstName: "", lastName: "", email: "", region: "" });
    setEditMode(false);
    setShowForm(true);
  };
  //Müşteri düzenleme işlevi
  const handleEditCustomer = (customer) => {
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      region: customer.region,
    });
    setCurrentCustomer(customer);
    setEditMode(true);
    setShowForm(true);
  };
  //Müşteri silme işlevi
  const handleDeleteCustomer = async (id) => {
    try {
      await api.delete(`/customer/${id}`);
      setCustomers(customers.filter((customer) => customer.id !== id));
      toast.success("Customer deleted successfully", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };
  //Form doğrulama işlevi
  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-zÇçĞğİıĞğÖöŞşÜü\s]+$/;

    if (
      !nameRegex.test(formData.firstName) ||
      formData.firstName.length < 3 ||
      formData.firstName.length > 16
    ) {
      newErrors.firstName =
        "First name must contain only letters, be at least 3 characters, and at most 16 characters.";
    }

    if (
      !nameRegex.test(formData.lastName) ||
      formData.lastName.length < 3 ||
      formData.lastName.length > 16
    ) {
      newErrors.lastName =
        "Last name must contain only letters, be at least 3 characters, and at most 16 characters.";
    }

    if (
      !nameRegex.test(formData.region) ||
      formData.region.length < 3 ||
      formData.region.length > 24
    ) {
      newErrors.region =
        "Region must contain only letters, be at least 3 characters, and at most 24 characters.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address.";
    }

    return newErrors;
  };
  //Form gönderme işlevi
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        region: formData.region,
        userId: parseInt(userId, 10),
      };

      if (editMode) {
        await api.put(`/customer/${currentCustomer.id}`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.success("Customer updated successfully ", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        await api.post("/customer/create", data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.success("Customer added successfully 🎉", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      setShowForm(false);
      setFormData({ firstName: "", lastName: "", email: "", region: "" });
      setErrors({});

      const response = await api.get("/customer/loggedIn");
      setCustomers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrors({
          email:
            "This email is already registered. Please use a different email.",
        });
      } else {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form. Please try again.");
      }
    }
  };
  //Filtreleri temizleme işlevi
  const handleClearFilters = async () => {
    setFilterFirstName("");
    setFilterEmail("");
    setFilterRegion("");

    try {
      const response = await api.get("/customer/loggedIn");
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers after clearing filters:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen  relative">
      <div className="flex justify-center sm:justify-end">
        <button
          onClick={handleLogout}
          className="mb-4  top-4 right-6 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap justify-center space-y-2 sm:space-y-0 w-full mb-4">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by First Name"
            value={filterFirstName}
            onChange={(e) => setFilterFirstName(e.target.value)}
            className="w-full sm:w-44 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by Email"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by Region"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="w-full flex justify-center sm:space-x-2">
          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto px-4 py-2 mt-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600"
          >
            Clear Filters
          </button>

          <button
            onClick={handleFilter}
            className="w-full sm:w-auto px-4 py-2 mt-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="mb-4 w-full">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex flex-col md:flex-row sm:justify-center md:justify-start items-center mb-4">
        <button
          onClick={handleAddCustomer}
          className="mb-4 md:mb-0 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
        >
          <FaPlus className="inline-block mr-2" /> Add Customer
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleFormSubmit}>
          <h3 className="text-xl font-semibold text-center mb-4">
            {editMode ? "Edit Customer" : "Add Customer"}
          </h3>

          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className={`w-full px-4 py-2 border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className={`w-full px-4 py-2 border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700"
            >
              Region
            </label>
            <input
              id="region"
              type="text"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className={`w-full px-4 py-2 border ${
                errors.region ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.region && (
              <p className="text-red-500 text-sm">{errors.region}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
          >
            {editMode ? "Update Customer" : "Add Customer"}
          </button>
        </form>
      </Modal>
      <ToastContainer />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-left shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 md:p-4 whitespace-nowrap">First Name</th>
              <th className="p-2 md:p-4 whitespace-nowrap">Last Name</th>
              <th className="p-2 md:p-4 whitespace-nowrap">Email</th>
              <th className="p-2 md:p-4 whitespace-nowrap">Region</th>
              <th className="p-2 md:p-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="bg-white border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-2 md:p-4">{customer.firstName}</td>
                <td className="p-2 md:p-4">{customer.lastName}</td>
                <td className="p-2 md:p-4">{customer.email}</td>
                <td className="p-2 md:p-4">{customer.region}</td>
                <td className="p-2 md:p-4">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-500 hover:text-blue-700 mr-2 md:mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-500 hover:text-red-700"
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
