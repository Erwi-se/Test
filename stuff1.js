function getCard(cardCount) {
  let array = [...Array(22).keys()];
  let result = [];
  let id = [...Array(cardCount).keys()].map(i => i+1);
  console.log(id)
  for (let i = 1; i <= cardCount; i++) {
    const random = Math.floor(Math.random() * (22- i));
    result.push(arr[random]);
    array[random] = array[22 - i];
  }
    
  for (let i = 0; i < slider.value; i++) {
    document.getElementById(id[i]).src = result[i] + "_tarot.png";
  }
  console.log(result)
}

function getDes(url) {
  let src = url.match(/\d+(?=_)/g);
  if (src == 0) {
  document.getElementById("des").innerHTML = "The Fool";
  }
}