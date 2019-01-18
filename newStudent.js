
var ref=firebase.app().database().ref()
var userRef=ref.child('users')

var students=[];

/**@returns {Promise} a promise with the student data in it */
async function getStudent(fn,ln,isCaseSensitive=false){
    return new Promise((resolve,reject)=>{
        ref.once('value',(snapshot)=>{
            var val=snapshot.val()
            for(p1 in val){
                for(p2 in val[p1]){
                    if(isCaseSensitive){
                        if(val[p1][p2]['firstName']===fn&&val[p1][p2]['lastName']===ln){
                            resolve(val[p1][p2])
                        }
                    }else{
                        if(val[p1][p2]['firstName'].toLowerCase()===fn.toLowerCase()&&val[p1][p2]['lastName'].toLowerCase()===ln.toLowerCase()){
                            resolve(val[p1][p2])
                        }
                    }
                }
            }
        })
    })
}

function getStu(fn='',ln='',isCaseSensitive=false){
    return students.filter(stu=>(isCaseSensitive)?stu.stu.firstName===fn&&stu.stu.lastName===ln:stu.stu.firstName.toLowerCase()===fn.toLowerCase()&&stu.stu.lastName.toLowerCase()===ln.toLowerCase())[0]
}

ref.orderByChild("lastName").on('child_added',()=>{})

function setStuData(fn,ln,{firstName,lastName,period,year,min,hours}={}){
    /*
    ref.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            for(p2 in val[p1]){
                if(val[p1][p2]['firstName']===fn&&val[p1][p2]['lastName']===ln){
                    var refrence=p1+'/'+p2+'/' //This is the student
                    var updateObj={}
                    if(firstName)
                        updateObj[refrence+'firstName']=firstName
                    if(lastName)
                        updateObj[refrence+'lastName']=lastName
                    if(period)
                        updateObj[refrence+'period']=period
                    if(year)
                        updateObj[refrence+'year']=year
                    if(min)
                        updateObj[refrence+'min']=min
                    if(hours)
                        updateObj[refrence+'hours']=hours

                    ref.update(updateObj)
                }
            }
        }
    })//.then(()=>updateTable())
    */
    var stuAndRef=students.filter(stu=>{
        return stu.stu.firstName===fn&&stu.stu.lastName===ln
    })[0]
    console.log(stuAndRef)
    var updateObj={}
    if(firstName)
        updateObj[stu.ref+'firstName']=firstName
    if(lastName)
        updateObj[stu.ref+'lastName']=lastName
    if(period)
        updateObj[stu.ref+'period']=period
    if(year)
        updateObj[stu.ref+'year']=year
    if(min)
        updateObj[stu.ref+'min']=min
    if(hours)
        updateObj[stu.ref+'hours']=ho
    ref.update(updateObj)
}

function removeStu(fn,ln,isCaseSensitive){
    console.log('Trying to remove',fn,ln)
    var hasRemoved=false
    ref.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            for(p2 in val[p1]){
                if(isCaseSensitive){
                    if(val[p1][p2]['firstName']===fn&&val[p1][p2]['lastName']===ln){
                        var refrence=p1+'/'+p2 //This is the student
                        var updateObj={}
                        updateObj[refrence]=null
                        ref.update(updateObj)
                        hasRemoved=true
                    }
                }else{
                    if(val[p1][p2]['firstName'].toLowerCase()===fn.toLowerCase()&&val[p1][p2]['lastName'].toLowerCase()===ln.toLowerCase()){
                        var refrence=p1+'/'+p2 //This is the student
                        var updateObj={}
                        updateObj[refrence]=null
                        ref.update(updateObj)
                        hasRemoved=true
                    }
                }
            }
        }
    })
    if(!hasRemoved)
        alert('Could not find student '+fn+' '+ln)
}

/**Moves the minutes that are greater than 60 to the hours */
function updateStuHours(){
    ref.once('child_added',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            for(p2 in val[p1]){
                
                
                if(parseInt(val[p1][p2].hours)>0){
                    console.log(val[p1][p2])
                    var m=Time.toMin(parseInt(val[p1][p2].hours),parseInt(val[p1][p2].min))
                    console.log(m)
                    //setStuData(val[p1][p2].firstName,val[p1][p2].lastName,{min:m,hours:0})
                }
                
            }
        }
    })
}
ref.on('value',updateStuHours)

function addToTable(stu){
    var row=document.createElement('tr')
    function addToRow(s){
        var ele=document.createElement('td')
        ele.innerHTML=s
        row.appendChild(ele)
        return ele;
    }
    var table=document.getElementById('stuView')
    
    addToRow(stu.lastName+", "+stu.firstName).classList.add('dropDownContent')
    addToRow(stu.hours+' hours, '+stu.min+' minutes').classList.add('dropDown')
    addToRow(stu.period)
    addToRow(stu.year)

    table.appendChild(row)
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
    ref.once('value',function(snapshot){
        var val = snapshot.val();
        for(part in val)
            for(prop in val[part])
                console.log(val[part][prop])
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
    return date(new Date(),min)
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
    students.filter(stu=>stu.stu.year==2).forEach(stu=>{
        var o={}
        o[stu.ref.substr(0,stu.ref.length-2)]=null
        ref.set(o)
    })
}