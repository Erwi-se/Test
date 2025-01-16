* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.container {
  display: flex;
  flex-wrap: wrap; /* Allow the container to wrap its items */
  justify-content: center;
  width: 100%;
  gap: 5px 1%;
  perspective: 1000px; /* Add perspective to the container */
}

.card {
  width: 20%;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  position: relative;
}

.card img {
  width: 100%;
  backface-visibility: hidden; /* Hide the back face of the card */
}

.card .front {
  position: absolute;
  top: 0;
  left: 0;
}

.card .back {
  transform: rotateY(180deg); /* Rotate the back face */
}

.card.flipped {
  transform: rotateY(180deg); /* Flip the card */
}