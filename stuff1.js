function getCard() {
  let arr = [...Array(22).keys()] 
    
  let result = [];    
  for (let i = 1; i <= 4; i++) {
    const random = Math.floor(Math.random() * (22- i));
    result.push(arr[random]);
    arr[random] = arr[22 - i];
  }

  let id = [1, 2, 3, 4]
  for (let i = 0; i < 4; i++) {
  
    document.getElementById(id[i]).src = result[i] + "_tarot.png";
  }
  console.log(result)
  return result;
}

function getDes(id, result ) {
  document.getElementById("des").innerHTML = id;
}