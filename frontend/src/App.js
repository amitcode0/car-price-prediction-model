import React, { useState } from "react";
import axios from "axios";
import carBg from "./car.jpg"; // make sure car.jpg is in src folder
import "./App.css";

function App() {
  const manufacturers = [
    "Toyota",
    "Honda",
    "Ford",
    "BMW",
    "Mercedes",
    "Hyundai",
    "Kia",
    "Nissan",
    "Volkswagen",
  ];

  const models = {
    Toyota: ["Corolla", "Camry", "Fortuner", "Yaris"],
    Honda: ["Civic", "Accord", "City", "CR-V"],
    Ford: ["Fiesta", "Focus", "Mustang", "Explorer"],
    BMW: ["3 Series", "5 Series", "X3", "X5"],
    Mercedes: ["C-Class", "E-Class", "GLA", "GLC"],
    Hyundai: ["i20", "Creta", "Verna"],
    Kia: ["Seltos", "Sonet", "Sportage"],
    Nissan: ["Altima", "Sentra", "Rogue"],
    Volkswagen: ["Golf", "Passat", "Tiguan"],
  };

  const [formData, setFormData] = useState({
    year: 2015,
    odometer: 50000,
    manufacturer: "Toyota",
    model: "Corolla",
    fuel: "Petrol",
    transmission: "Manual",
  });

  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      setPrice(response.data.estimated_price);
    } catch (error) {
      console.error("Error predicting price:", error);
      setPrice(null);
    }
    setLoading(false);
  };

  return (
    <div
      className="app-container"
      style={{
        background: `url(${carBg}) no-repeat center center fixed`,
        backgroundSize: "cover",
      }}
    >
      <div className="form-box">
        <h1 className="title">Car Price Predictor</h1>

        {[
          {
            label: "Car Year",
            name: "year",
            type: "number",
            min: 1980,
            max: 2025,
          },
          { label: "Mileage (miles)", name: "odometer", type: "number" },
        ].map((field) => (
          <div className="input-group" key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              min={field.min}
              max={field.max}
            />
          </div>
        ))}

        <div className="input-group">
          <label>Manufacturer</label>
          <select
            name="manufacturer"
            value={formData.manufacturer}
            onChange={(e) =>
              setFormData({
                ...formData,
                manufacturer: e.target.value,
                model: models[e.target.value][0],
              })
            }
          >
            {manufacturers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Model</label>
          <select name="model" value={formData.model} onChange={handleChange}>
            {models[formData.manufacturer].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Fuel Type</label>
          <select name="fuel" value={formData.fuel} onChange={handleChange}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        <div className="input-group">
          <label>Transmission</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        <button
          className="predict-btn"
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict Price"}
        </button>

        {price !== null && (
          <h2 className="price-display">
            Estimated Price: ${price.toLocaleString()}
          </h2>
        )}
      </div>
    </div>
  );
}

export default App;
