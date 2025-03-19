import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
  const [users, setUsers] = useState([]);
  const [actionsCount, setActionsCount] = useState({ signup: 0, login: 0, addtocart: 0, payment: 0 });
  const [leadPointsData, setLeadPointsData] = useState({});
  const [productStatsData, setProductStatsData] = useState({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('https://leadcal-nu.vercel.app/');
      console.log('Fetched data:', res.data);
      setUsers(res.data);
      calculateActions(res.data);
      prepareLeadPointsData(res.data);
      prepareProductStats(res.data); // Add this line
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  const prepareProductStats = (data) => {
    const stats = {};
  
    data.forEach(user => {
      user.products.forEach(product => {
        if (!stats[product.name]) {
          stats[product.name] = { added: 0, paid: 0, unpaid: 0 };
        }
        stats[product.name].added += 1;
        if (product.paymentdone) {
          stats[product.name].paid += 1;
        } else {
          stats[product.name].unpaid += 1;
        }
      });
    });
  
    // Convert into Chart.js compatible format
    const labels = Object.keys(stats);
    const addedData = labels.map(name => stats[name].added);
    const paidData = labels.map(name => stats[name].paid);
    const unpaidData = labels.map(name => stats[name].unpaid);
  
    setProductStatsData({
      labels,
      datasets: [
        {
          label: 'Added to Cart',
          data: addedData,
          backgroundColor: '#007bff',
        },
        {
          label: 'Payment Done',
          data: paidData,
          backgroundColor: '#28a745',
        },
        {
          label: 'Unpaid',
          data: unpaidData,
          backgroundColor: '#dc3545',
        },
      ],
    });
  };
  

  const calculateActions = (data) => {
    let signup = 0, login = 0, addtocart = 0, payment = 0;
    data.forEach(user => {
      user.leadpointsrecord.forEach(record => {
        if (record.action === 'signup') signup++;
        if (record.action === 'login') login++;
        if (record.action === 'addtocart') addtocart++;
        if (record.action === 'payment') payment++;
      });
    });
    setActionsCount({ signup, login, addtocart, payment });
  };

  const prepareLeadPointsData = (data) => {
    const labels = data.map(user => user.email);
    const leadPoints = data.map(user => user.leadpoints);
    setLeadPointsData({
      labels,
      datasets: [
        {
          label: 'Lead Points',
          data: leadPoints,
          backgroundColor: '#6f42c1',
        },
      ],
    });
  };

  const actionsData = {
    labels: ['Signup', 'Login', 'Add to Cart', 'Payment'],
    datasets: [
      {
        label: 'Total Actions',
        data: [actionsCount.signup, actionsCount.login, actionsCount.addtocart, actionsCount.payment],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545'],
      },
    ],
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center text-primary fw-bold">🔥 Admin Dashboard 🔥</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card text-white bg-primary shadow p-3 mb-4 rounded text-center">
            <h4>Total Users</h4>
            <h2>{users.length}</h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-white bg-success shadow p-3 mb-4 rounded text-center">
            <h4>Total Lead Points</h4>
            <h2>{users.reduce((acc, user) => acc + user.leadpoints, 0)}</h2>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-12 mb-4">
          <div className="card p-3 shadow">
            <h4 className="text-center mb-3">📊 User Actions Overview</h4>
            <Bar data={actionsData} />
          </div>
        </div>

        {leadPointsData.labels && leadPointsData.labels.length > 0 && (
  <div className="col-12 mb-4">
    <div className="card p-3 shadow">
      <h4 className="text-center mb-3">🏆 Lead Points per User</h4>

      {/* Scrollable Container */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
        <Bar
          data={leadPointsData}
          options={{
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } },
            maintainAspectRatio: false,
            responsive: true,
          }}
          height={leadPointsData.labels.length * 40} 
        />
      </div>

    </div>
  </div>
)}


      </div>
      {productStatsData.labels && productStatsData.labels.length > 0 && (
  <div className="col-12 mb-4">
    <div className="card p-3 shadow">
      <h4 className="text-center mb-3">🛒 Product Stats Overview</h4>
      <Bar
        data={productStatsData}
        options={{
          responsive: true,
          plugins: { legend: { position: 'top' }, title: { display: true, text: 'Product Add & Payment Status' } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  </div>
)}


      <div className="row">
  {users.map((user, idx) => (
    <div key={idx} className="col-md-4 mb-4">
      <div className="card p-3 h-100 shadow user-card bg-light border-0">
        <h5 className="text-primary">{user.email}</h5>
        <p><strong>Address:</strong> {user.address || 'N/A'}</p>
        <p><strong>Lead Points:</strong> {user.leadpoints}</p>
        
        {/* Products List */}
        <h6>Products:</h6>
        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
          <ul className="list-unstyled mb-3">
            {user.products.map((product, pIdx) => (
              <li key={pIdx}>
                {product.name} - ₹{product.price} [{product.paymentdone ? 'Paid' : 'Unpaid'}]
              </li>
            ))}
          </ul>
        </div>

        {/* Lead Points Record */}
        <h6>Lead Points Record:</h6>
        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
          <ul className="list-group small">
            {user.leadpointsrecord.map((record, rIdx) => (
              <li key={rIdx} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{record.action}</strong> (+{record.points} pts)
                  <br />
                  <small>{new Date(record.timestamp).toLocaleString()}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  ))}
</div>


      <style>{`
        .user-card:hover {
          transform: translateY(-5px);
          transition: 0.3s;
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default App;
