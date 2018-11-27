
var ref=firebase.app().database().ref()
var userRef=ref.child('users')

var students=[];

async function getStudent(fn,ln){
    return new Promise((resolve,reject)=>{
        ref.once('value',(snapshot)=>{
            var val=snapshot.val()
            for(p1 in val){
                for(p2 in val[p1]){
                    var obj={},toAdd=false;
                    for(p3 in val[p1][p2]){
    
                        //p3 == names of property
                        //p2 is object above
    
                        if(p3==='firstName'&&val[p1][p2][p3]===fn){
                            toAdd=true
                            //console.log("First name good")
                        }else if(p3==='firstName'&&p3!==fn){
                            return false
                        }
                        if(p3==='lastName'&&val[p1][p2][p3]===ln){
                            //console.log('Last name good')
                            toAdd=true
                        }else if(p3==='lastName'&&p3!==ln){
                            return false
                        }
    
                        if(toAdd){
                            obj[p3]=val[p1][p2][p3]
                        }
                    }
                    if(toAdd){
                        resolve(obj)
                    }
                }
            }
        })
    })
}

function addToTable(stu){
    function m(t){return document.createElement(t)}
    var row=m('tr')
    function addToRow(t,s){
        var ele=m(t);
        ele.innerHTML=s
        row.appendChild(ele)
        return ele;
    }
    var table=document.getElementById('stuView')
    
    addToRow('td',stu.lastName+", "+stu.firstName)
    addToRow('td',stu.hours+' hours, '+stu.min+' minutes')
    addToRow('td',stu.period)
    addToRow('td',stu.year)

    table.appendChild(row)
}

function studentInit(){
    ref.once('value',(snapshot)=>{
        var val=snapshot.val();
        for(p1 in val){
            for(p2 in val[p1]){
                //Adds all the students to the table
                addToTable(val[p1][p2])
            }
        }
    })
}

function listStudents(){
    ref.once('value',function(snapshot){
        var val = snapshot.val();
        //console.log(val)
        for(part in val){
            //console.log(val[part])
            for(prop in val[part]){
                console.log(val[part][prop])
            }
        }
    },function (errorObject){
        console.log('Read Failed: '+errorObject.code)
    })
}

/**
 * @description Adds a new student to the students array
 * @param {string} firstName The student's first name
 * @param {string} lastName The student's last name
 * @param {number} curHours The current ammount of hours the student has
 * @param {number} curMins The current ammount of minutes out of an hour the student has
 * @param {number} classPeriod The 1st period that the student has the class
 * @param {1|2} year The year the student is enrolled in. 1 || 2
 */
function addStudent(firstName,lastName,curHours,curMins,classPeriod,year){
    if(firstName&&lastName&&curHours&&curMins&&classPeriod&&year){
        var cur={
            firstName:firstName,
            lastName:lastName,
            year:year,
            hours:curHours,
            min:curMins,
            period:classPeriod
        }
        userRef.push(cur)
        addCompletedWindow(firstName,lastName);
        return true;
    }else{
        alert("Please enter all the requested data");
        return false;
    }
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
    var win=document.createElement('div');
    win.id='addedStudent'
    win.style.visibility='hidden'
    document.body.appendChild(win);
}

function toggleNewStudentWindow(){
    var newStu=document.getElementById('newStudent')
    var stuBtn=document.getElementById('studentBtn')
    switch(newStu.style.visibility){
        case 'visible':
            newStu.style.visibility='hidden'
            stuBtn.style.visibility='visible'
            break
        case 'hidden':
            newStu.style.visibility='visible'
            stuBtn.style.visibility='hidden'            
            break
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