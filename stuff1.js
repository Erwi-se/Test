function getCard() {
  let array = [...Array(22).keys()];
  let result = [];
  let id = [...Array(cardCount).keys()].map(i => i + 1);

  for (let i = 1; i <= cardCount; i++) {
    const random = Math.floor(Math.random() * (22 - i));
    result.push(array[random]);
    array[random] = array[22 - i];
  }

  for (let i = 0; i < cardCount; i++) {
    document.getElementById(id[i]).src = result[i] + "_tarot.png";
  }

  console.log(result);
}

function getDes(url) {
  let src = url.match(/\d+(?=_)/g);
  if (src == 0) {
    document.getElementById("description").innerHTML = "The Fool";
  }
}

// Add an event listener to update the card count display
document.getElementById("cardRange").addEventListener("input", function() {
  document.getElementById("cardCount").textContent = this.value;
});