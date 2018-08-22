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
 * @param {number} year The year the student is enrolled in. 1 || 2
 */
function addStudent(firstName,lastName,curHours,curMins,classPeriod,year){
    if(firstName&&lastName&&curHours&&curMins&&classPeriod&&year){
        var cur={
            name:{
                first:firstName,
                last:lastName
            },
            time:{
                year:year,
                hours:curHours,
                min:curMins
            },
            period:classPeriod,
        }
        students.push(cur);
        //Sorts alphabetically by last name
        students.sort(function(a,b){
            var tempA=a.name.last.toUpperCase();
            var tempB=b.name.last.toUpperCase();
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

function addCompletedWindow(first,last){
    var win=document.createElement('div');
    win.id='addedStudent'
    /*win.style.width=50+'px'
    win.style.height=50+'px'
    win.style.cssFloat='right';
    win.style.border='solid black 2px'*/
    
    document.body.appendChild(win);
}

function showNewStudentWindow(){document.getElementById('newStudent').style.visibility="visible"}
function hideNewStudentWindow(){document.getElementById('newStudent').style.visibility='hidden'}