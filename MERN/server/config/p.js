var json = '{"0":"1","1":"2","2":"3","3":"4"}';

var parsed = JSON.parse(json);

var arr = [];


const result = json.Issues.map( o => 
    o.Values.reduce( (acc, {Key, Value}) =>
        (acc[Key] = Value, acc), {}));
        
for(var x in parsed){
  arr.push(parsed[x]);
}

console.log(parsed)