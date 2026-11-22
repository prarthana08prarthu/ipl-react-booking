import "./App.css";
import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import MatchCard from "./MatchCard";

function App() {
  const [likes, setLikes] = useState(0);

  const matches = [
    {
      id: 1,
      team1: "RCB",
      team2: "CSK",
      date: "25 March 2026",
      venue: "Bengaluru"
    },
    {
      id: 2,
      team1: "MI",
      team2: "KKR",
      date: "27 March 2026",
      venue: "Mumbai"
    },
    {
      id: 3,
      team1: "SRH",
      team2: "RR",
      date: "29 March 2026",
      venue: "Hyderabad"
    }
  ];

  return (
    <div>
      <Navbar />
      <Hero />

      <h1>Upcoming Matches</h1>

      {matches.map((match) => (
        <MatchCard
          key={match.id}
          team1={match.team1}
          team2={match.team2}
          date={match.date}
          venue={match.venue}
        />
      ))}

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
