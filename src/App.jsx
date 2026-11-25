
import "./App.css";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

import Navbar from "./Navbar";
import Hero from "./Hero";
import MatchCard from "./MatchCard";

function App() {
  const [likes, setLikes] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking form states
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userName, setUserName] = useState("");
  const [tickets, setTickets] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch matches from Supabase
  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching matches:", error.message);
      setError(error.message);
    } else {
      setMatches(data);
      setError(null);
    }

    setLoading(false);
  };

  // Fetch matches and enable Realtime updates
  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches"
        },
        (payload) => {
          console.log("Database changed:", payload);
          fetchMatches();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription:", status);
      });

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate total price
  const totalPrice = selectedMatch
    ? selectedMatch.price * Number(tickets)
    : 0;

  // Open booking form
  const handleBook = (match) => {
    setSelectedMatch(match);
    setUserName("");
    setTickets(1);
    setBookingMessage("");
  };

  // Submit booking to Supabase
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedMatch || !userName.trim()) {
      setBookingMessage("Please enter your name.");
      return;
    }

    const quantity = Number(tickets);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setBookingMessage("Enter a valid ticket quantity.");
      return;
    }

    if (quantity > selectedMatch.available_seats) {
      setBookingMessage("Not enough seats available.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    const { data, error } = await supabase.rpc("create_booking", {
      p_match_id: selectedMatch.id,
      p_user_name: userName.trim(),
      p_tickets: quantity
    });

    if (error) {
      setBookingMessage("Booking failed: " + error.message);
    } else {
      const booking = data[0];

      setBookingMessage(
        `Booking successful! Booking ID: ${booking.booking_id}. Total: ₹${booking.total_price}`
      );

      setSelectedMatch(null);
      await fetchMatches();
    }

    setBookingLoading(false);
  };

  return (
    <div>
      <Navbar />
      <Hero />

      <h1>Upcoming Matches</h1>

      {loading && <p>Loading matches...</p>}

      {error && (
        <p style={{ color: "red" }}>
          Error loading matches: {error}
        </p>
      )}

      {!loading && !error && matches.length === 0 && (
        <p>No matches available.</p>
      )}

      {!loading && !error && matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onBook={handleBook}
        />
      ))}

      {/* Booking Form */}
      {selectedMatch && (
        <div className="match-card">
          <h2>Book Tickets</h2>

          <h3>
            {selectedMatch.team1} vs {selectedMatch.team2}
          </h3>

          <form onSubmit={handleBooking}>
            <label>Your Name</label>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <label>Number of Tickets</label>

            <input
              type="number"
              min="1"
              max={selectedMatch.available_seats}
              value={tickets}
              onChange={(e) => setTickets(e.target.value)}
              required
            />

            <p>Price per ticket: ₹{selectedMatch.price}</p>

            <h3>Total Price: ₹{totalPrice}</h3>

            <button type="submit" disabled={bookingLoading}>
              {bookingLoading ? "Processing..." : "Confirm Booking"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedMatch(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {bookingMessage && (
        <p style={{ textAlign: "center", margin: "20px" }}>
          {bookingMessage}
        </p>
      )}

      <h2>Support Your Favourite Team!</h2>

      <p>Likes: {likes}</p>

      <button onClick={() => setLikes(likes + 1)}>
        Like ❤️
      </button>

      <button onClick={() => setLikes(0)}>
        Reset
      </button>
    </div>
  );
}

export default App;
