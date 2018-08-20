var students=[];

/**
 * @description Adds a new student to the students array
 * @param {string} firstName The student's first name
 * @param {string} lastName The student's last name
 * @param {number} curHours The current ammount of hours the student has
 * @param {number} curMins The current ammount of minutes out of an hour the student has
 * @param {number} classPeriod The 1st period that the student has the class
 * @param {number} year The year the student is enrolled in. 1 || 2
 */
function addPerson(firstName,lastName,curHours,curMins,classPeriod,year){
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
            class:classPeriod,
        }
        students.push(cur);
        //Sorts alphabetically by last name
        students.sort(function(a,b){
            var tempA=a.name.last.toUpperCase();
            var tempB=b.name.last.toUpperCase();
            return(tempA<tempB)?-1:(tempA>tempB)?1:0;
        });
    }else{
        alert("Please enter all the requested data");
    }
}

