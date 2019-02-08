
var ref=firebase.app().database().ref()
var userRef=ref.child('users')

var students=[];

function strEqual(s1,s2,isCaseSensitive=false){
    return (isCaseSensitive)?s1===s2:s1.toLowerCase()===s2.toLowerCase()
}

/**@returns {Promise} a promise with the student data in it */
async function getStudent(fn,ln,isCaseSensitive=false){
    return new Promise((resolve,reject)=>{
        ref.once('value',(snapshot)=>{
            var val=snapshot.val()
            for(p1 in val){
                for(p2 in val[p1]){
                    if(strEqual(val[p1][p2].firstName,fn,isCaseSensitive)&&strEqual(val[p1][p2].lastName,ln,isCaseSensitive))
                        resolve(val[p1][p2])
                }
            }
        })
        reject('Student not found')
    })
}

function getStu(fn='',ln='',isCaseSensitive=false){
    return students.filter(stu=>strEqual(stu.stu.firstName,fn,isCaseSensitive)&&strEqual(stu.stu.lastName,ln,isCaseSensitive))[0]
}

function setStuData(fn,ln,{firstName,lastName,period,year,min}={}){
    var stuAndRef=getStu(fn,ln)
    var updateObj={}
    if(firstName)
        updateObj[stuAndRef.ref+'firstName']=firstName
    if(lastName)
        updateObj[stuAndRef.ref+'lastName']=lastName
    if(period)
        updateObj[stuAndRef.ref+'period']=period
    if(year)
        updateObj[stuAndRef.ref+'year']=year
    if(min)
        updateObj[stuAndRef.ref+'min']=min
    console.log(updateObj)
    ref.update(updateObj)
}

function removeStu(fn,ln,isCaseSensitive){
    console.log('Trying to remove',fn,ln)
    var hasRemoved=false

    userRef.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            if(strEqual(val[p1].firstName,fn,isCaseSensitive)&&strEqual(val[p1].lastName,ln,isCaseSensitive)){
                var updateObj={}
                updateObj[p1]=null
                userRef.update(updateObj)
                hasRemoved=true
            }
        }
    })
    if(!hasRemoved)
        alert('Could not find student '+fn+' '+ln)
}

function addToTable(stu){
    var row=document.createElement('tr')
    function addToRow(s){
        var ele=document.createElement('td')
        ele.innerHTML=s
        row.appendChild(ele)
        return ele;
    }
    function addToRowInput(){
        var date = document.createElement("input");
        var hrs = document.createElement("input");
        var min = document.createElement("input");
        var but = document.createElement("button");
        var br = document.createElement("br");
        var y = document.createElement('td');
        date.classList.add("addingTimeDate");
        hrs.classList.add("addingTime");
        min.classList.add("addingTime");
        but.classList.add("SubmitHrs");
        date.id = "addingTimeDate";
        hrs.id = "addingHrs";
        min.id = "addingMin";
        but.id = "SubmitHrs";
        date.setAttribute("type", "text");
        hrs.setAttribute("type", "number");
        hrs.setAttribute('value', '0');
        min.setAttribute("type", "number");
        min.setAttribute('value', '0');
        but.innerHTML = "Submit";
        but.onclick=submit;
        y.appendChild(date);
        y.appendChild(br);
        y.appendChild(hrs);
        y.appendChild(min);
        y.appendChild(but);
        row.appendChild(y);
    }
    var table=document.getElementById('stuView')
    
    addToRow(stu.lastName+", "+stu.firstName)//.classList.add('dropDownContent')
    var t=Time.toHours(stu.min)
    addToRow(t.hour+' hours, '+t.min+' minutes').classList.add('dropDown')
    addToRow(stu.period)
    addToRow(stu.year)
    addToRowInput();

    table.appendChild(row)
}

/**Goes through every student and tallies up their calendar's minutes to update the running total minutes */
function tallyStudentHours(){
    students.forEach(stuAndRef=>{
        var stu=stuAndRef.stu
        var min=0
        stu.calendar.forEach(dateAndMin=>{
            min+=parseInt(dateAndMin.min)
        })
        var o={}
        o[stuAndRef.ref+'min']=min
        ref.update(o)
    })
}

function studentInit(){
    students=[]
    ref.once('value',(snapshot)=>{
        var val=snapshot.val();
        for(p1 in val){
            for(p2 in val[p1]){
                //Adds all the students to the table
                addToTable(val[p1][p2])
                students.push({ref:p1+'/'+p2+'/',stu:val[p1][p2]})
            }
        }
    })
}

function listStudentsInConsole(){
    userRef.orderByChild('lastName').once('value',function(snapshot){
        var val = snapshot.val();
        for(part in val)
            console.log(val[part])
    },(errorObject)=>{
        console.log('Read Failed: '+errorObject.code)
    })
}

/**
 * @description Adds a new student to the students array
 * @param {string} firstName The student's first name
 * @param {string} lastName The student's last name
 * @param {number} curHours The current ammount of hours the student has
 * @param {number} curMins The current ammount of minutes out of an hour the student has
 * @param {1|2|3|4|5|6|7} classPeriod The 1st period that the student has the class
 * @param {1|2} year The year the student is enrolled in. 1 || 2
 */
function addStudent(firstName,lastName,classPeriod,year,curHours=0,curMins=0){
    var hasData=(firstName!==undefined&&firstName!==''&&lastName!==undefined&&lastName!==''&&classPeriod!==undefined&&year!==undefined),
        dataGood=(/^[1-7]{1}$/.test(classPeriod)&&/[1-2]/.test(year)&&parseInt(classPeriod)===parseFloat(classPeriod)&&parseInt(year)===parseFloat(year))
    if(hasData&&dataGood){
        userRef.push({
            firstName:firstName,
            lastName:lastName,
            year:year,
            /**This is the total minutes the student has. Gets converted to hours and min */
            min:Time.toMin(curHours,curMins),
            /**This will hold all the dates along with the time for that date. Adding to them will be with the date() func */
            calendar:[today(Time.toMin(curHours,curMins))],
            period:classPeriod
        })

        addCompletedWindow(firstName,lastName);
        return true;
    }else{
        if(!hasData)
            alert("Please enter all the requested data");
        else
            alert("Make sure all inputs are within range")
        return false;
    }
}

function addDateToStudent(fn,ln,dateAndMin){
    var stuAndRef=getStu(fn,ln)
    if(stuAndRef){
        var cal=stuAndRef.stu.calendar
        cal.push(dateAndMin)
        var o={}
        o[stuAndRef.ref+'calendar/']=cal
        ref.update(o)
    }else{
        console.log(0)
    }
}

const Time={
    /**Returns the time in minutes from hours and minutes */
    toMin(hour=0,min=0){
        return (parseInt(hour)*60)+parseInt(min)
    },
    /**Returns an object with hour and min holding the times from the minutes passed in*/
    toHours(min){
        return {hour:Math.floor(min/60),min:min%60}
    }
}

function date(dateString,min){
    return {date:new Date(dateString).toDateString(),min:min}
}
function today(min){
    return date(new Date().toDateString(),min)
}

var completedWindowTimeout=0,newWindow=false;
const completedWindowTimeoutMax=100;

function addCompletedWindow(first,last){
    var ele=document.getElementById('addedStudent')
    ele.innerHTML=first+' '+last+' was added successfully'
    ele.style.visibility='visible'
    newWindow=true
}

function eleInit(){
    document.getElementById('newStudent').style.visibility='hidden';
    document.getElementById('RemoveStu').style.visibility='visible'
    document.getElementById('preTime').style.display='none'
}

function showExtraDataInput(){
    document.getElementById('preTime').style.display=(document.getElementById('checked').checked)?'block':'none'
}

function toggleNewStudentWindow(){
    var newStu=document.getElementById('newStudent')
    var stuBtn=document.getElementById('studentBtn')
    switch(newStu.style.visibility){
        case 'visible':
            var checked=document.getElementById('checked')
            if(checked.checked)
                checked.click()
            newStu.style.visibility='hidden'
            stuBtn.style.visibility='visible'
            break
        case 'hidden':
            newStu.style.visibility='visible'
            stuBtn.style.visibility='hidden'            
            break
    }
}

function toggleRemoveStudentWindow(){
    var btn=document.getElementById('RemoveStu')
    var window=document.getElementById('RemoveMenu')
    switch(btn.style.visibility){
        case 'visible':
            btn.style.visibility='hidden'
            window.style.visibility='visible'
            break
        case 'hidden':
            btn.style.visibility='visible'
            window.style.visibility='hidden'

    }
}

var completedTimeout=setInterval(()=>{
    if(newWindow&&completedWindowTimeout<completedWindowTimeoutMax)
        completedWindowTimeout++
    else{
        completedWindowTimeout=0
        newWindow=false;
        document.getElementById('addedStudent').style.visibility='hidden'
    }
},60)

function clearTable(){
    var div=document.getElementById('listView')
    var table=div.querySelector('table')
    var rows=table.querySelectorAll('tr')
    for(let i=1;i<rows.length;i++){
        table.removeChild(rows[i])
    }
}

ref.on('child_added',updateAll)
ref.on('child_removed',updateAll)
ref.on('child_changed',updateAll)
ref.on('child_moved',updateAll)

function updateAll(){
    //updateStuHours()
    updateTable()
}

function updateTable(){
    clearTable()
    studentInit()
}

function removeYear2(){
    if(confirm('Are you sure you want to remove all year 2 students?')){
        students.filter(stu=>stu.stu.year==2).forEach(stu=>{
            removeStu(stu.stu.firstName,stu.stu.lastName)
        })
        students.forEach(stuAndRef=>{
            var o={}
            o[stuAndRef.ref+'year']=parseInt(stuAndRef.stu.year)+1
            ref.update(o)
        })
    }
}

function sampleStudents(n=1){
    var fns=['Joe','Hannah','Gary','Sue','John','Jenny','Bob','Tim','Mary','Neo','Devin','Linda','Brenda','Paula','Marie','Lucy',
            'Alice','Shane','Sam','Anne','Aliyah','Jean','Ellen','Max','Alan','Erik','Charles','Omar','Robbie','Oliver','Jimmy']
    var lns=['Smith','Johnson','Holtsclaw','Phelps','Brito','Mayorga','Smith','Law','Jones','Davis','Miller','Brown','Williams',
            'Hill','Lopez','Young','Allen','Morris','Price','Long','Nelson','Jackson','White','Phillips','Clark','Lee','Lewis']
    function rnd(arr){
        return arr[parseInt(Math.random()*arr.length)]
    }
    for(let i=0;i<n;i++){
        addStudent(rnd(fns),rnd(lns),parseInt(Math.random()*7)+1,parseInt(Math.random()*2)+1)
    }
}
function submit(){
    document.body.style.backgroundColor = 'black';
}