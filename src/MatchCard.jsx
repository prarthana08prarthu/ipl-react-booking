
function MatchCard({ match, onBook }) {
  return (
    <div className="match-card">
      <h2>{match.team1} vs {match.team2}</h2>

      <p>Date: {match.date}</p>

      <p>Venue: {match.venue}</p>

      <p>Ticket Price: ₹{match.price}</p>

      <p>Available Seats: {match.available_seats}</p>

      <button
        onClick={() => onBook(match)}
        disabled={match.available_seats <= 0}
      >
        {match.available_seats > 0 ? "Book Tickets" : "Sold Out"}
      </button>
    </div>
  );
}

export default MatchCard;
