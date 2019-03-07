console.log(new Date('2017-09-28T22:59:02.448804522Z').valueOf())

const currentTime = new Date('2019-02-28T22:59:02.448804522Z').valueOf()
    
const expiryTime = new Date('2017-09-29T22:59:02.448804522Z').valueOf()

if (currentTime < expiryTime) {
    console.log('not expired')
}

console.log(Math.random().toString(26).slice(10))