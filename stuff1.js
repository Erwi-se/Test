function getCard() {
  let arr = [...Array(22).keys()] 
  let result = [];
  let id = [1, 2, 3, 4] 
  
  for (let i = 1; i <= 4; i++) {
    const random = Math.floor(Math.random() * (22- i));
    result.push(arr[random]);
    arr[random] = arr[22 - i];
    if (i == 4) {
      for (let k = 0; k < 4; k++) {
      document.getElementById(id[k]).src = result[k] + "_tarot.png";
      }
    }
  }
  console.log(result)
}

function getDes(id) {
  document.getElementById("des").innerHTML = id;
}