import React, { useState, useEffect } from "react";
import "../styles/UniversitySearch.css"; // Import the CSS file
import universityData from "../assets/us_institutions.json";

const UniversitySearch = () => {
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      setUniversities(universityData);
      setFilteredUniversities(universityData);
    };

    fetchUniversities();
  }, []);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    if (query === "") {
      setFilteredUniversities(universities);
      setShowDropdown(false);
    } else {
      const filtered = universities.filter((uni) =>
        uni.institution.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUniversities(filtered);
      setShowDropdown(filtered.length > 0);
    }
  };

  const handleSelectUniversity = (university) => {
    setSearch(university.institution);
    setShowDropdown(false); // Hide the dropdown after selection
  };

  return (
    <div className="university-dropdown">
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search for a university..."
        className="university-input"
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && filteredUniversities.length > 0 && (
        <ul className="university-list">
          {filteredUniversities.map((uni, index) => (
            <li key={index} onClick={() => handleSelectUniversity(uni)}>
              {uni.institution}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UniversitySearch;