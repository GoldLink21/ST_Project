
var ref=firebase.app().database().ref()
var userRef=ref.child('users')

var students=[];
function studentInit(){
    
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
        students.push(cur);
        //Sorts alphabetically by last name
        students.sort(function(a,b){
            var tempA=a.lastName.toUpperCase();
            var tempB=b.lastName.toUpperCase();
            return(tempA<tempB)?-1:(tempA>tempB)?1:0;
        });
        //alert(firstName+" "+lastName+' was added successfully')
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