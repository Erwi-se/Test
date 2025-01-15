addEventListener("DOMContentLoaded", function() {
slider = document.getElementById("cardRange");
output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}
});

function getCard(slider) {
  let arr = [...Array(22).keys()];
  let result = [];
  let id = [...Array(slider.value).keys()].map(i => i+1);
  console.log(id)
  for (let i = 1; i <= slider.value; i++) {
    const random = Math.floor(Math.random() * (22- i));
    result.push(arr[random]);
    arr[random] = arr[22 - i];
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