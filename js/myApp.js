var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "./home.html",
      controller: "homeController",
    })

    .when("/description", {
      templateUrl: "./description.html",
    })

    .when("/contact", {
      templateUrl: "./contact.html",
    })

    .when("/course", {
      templateUrl: "./course.html",
      controller: "coursesController",
    })

    .when("/testing/:id/:name", {
      templateUrl: "./testing.html",
      controller: "testingController",
    })

    .when("/forgetPass", {
      templateUrl: "./forgetPass.html",
      controller: "forgetPassController"
    })

    .when("/changePass/:id/:password", {
      templateUrl: "./changePass.html",
      controller: "changePassController"
    })

    .when("/updateAccount", {
      templateUrl: "./updateAccount.html",
      controller: "updateAccountController"
    })

    .otherwise({
      templateUrl: "./homde.html"
    });
});

app.directive("quizForm", function (quizFactory, $interval, dataService) {
  return {
    restrict: 'AE',
    scope: {},
    templateUrl: "./quizForm.html",
    link: function (scope, element, attrs) {
      scope.id = 0;
      scope.minutes = 1;
      scope.seconds = 0;
      scope.finish = false;
      scope.displayMinutes = scope.minutes < 10 ? "0" + scope.minutes : scope.minutes;
      scope.displaySeconds = scope.seconds < 10 ? "0" + scope.seconds : scope.seconds;
      scope.startCount = function() {
        scope.seconds--;
        if(scope.seconds === -1) {
        scope.minutes -= 1;
        scope.seconds = 59;
        }

        scope.displayMinutes = scope.minutes < 10 ? "0" + scope.minutes : scope.minutes;
        scope.displaySeconds = scope.seconds < 10 ? "0" + scope.seconds : scope.seconds;
        if(scope.minutes === 0 && scope.seconds === 0) {
          alert('Hết giờ');
          scope.stopCountdown();
        }
      }
      
      scope.stopCountdown = function() {
        scope.finish = ! scope.finish;
        $interval.cancel(myTimeout);
        alert('stop');
      }
      var myTimeout = $interval(scope.startCount, 1000);


      scope.start = function () {
        quizFactory.getQues().then(function () {
          scope.getQuestion();
          scope.nameSubject = quizFactory.nameSubject();
          scope.sumQuestion = quizFactory.numberOfQuestion();
        })
      };

      scope.remake = function () {
        scope.saveTheResult(scope.count);
        scope.minutes = 1;
        scope.seconds = 0;
        scope.id = 0;
        scope.count = 0;
        // myTimeout = $interval(scope.startCount, 1000);
        scope.start();
      }

      scope.goHome = function() {
        scope.saveTheResult(scope.count);
        location = "#/!";
      }

      scope.saveTheResult = function (result) {
        scope.currentInfo = JSON.parse(localStorage.getItem("currenrUserInfo"))
        dataService.updateData(scope.currentInfo.id, {"marks" :  result}).then(function (respon) {
        }, function (err) {
          alert("failed");
        })
      }

      scope.getQuestion = function () {
        let quiz = quizFactory.getQuestion();
        if (quiz) {
          scope.question = quiz.Text;
          scope.options = quiz.Answers;
          scope.answTrue = quiz.AnswerId;
          scope.mark = quiz.Marks;
        }
      };

      scope.count = 0;
      scope.checkAns = function (mark) {
        if (!$('input[name = answ]:checked').length) {
          return
        }

        let answer = $('input[name = answ]:checked').val();

        if (parseInt(answer) == scope.answTrue) {
          scope.count = scope.count + scope.mark;
        }

      };

      scope.nextQuestion = function (disable) {
        scope.id++;
        scope.checkAns();
        scope.getQuestion();
        scope.disable = !disable;
      };

      scope.geek = function (disable) {
        scope.disable = !disable;
      }
      scope.start();

    }
  }
});

app.factory('quizFactory', function ($http, $routeParams) {
  // $http.get('./db/Quizs/'+ $routeParams.id + '.js').then(function(respon) {
  //   question = respon.data;
  // });

  return {
    getQues: () => {
      return $http.get('./db/Quizs/' + $routeParams.id + '.js').then(function (respon) {
        question = respon.data;
      });
    },
    getQuestion: function () {
      let randomItem = question[Math.floor(Math.random() * question.length)];
      return randomItem;
    },
    numberOfQuestion: () => question.length,
    nameSubject: () => $routeParams.name
  }

});

// courses côntroller
app.controller("coursesController", function ($scope, $http) {
  $scope.listSubjects = [];
  $scope.listSubDisplay = [];
  $scope.listSub = [];
  $scope.pageNumbers = [];
  $scope.displayCourses = [];
  $scope.display = [];
  $scope.subId = 0;


  $http.get("./db/Subjects.js").then(function (response) {
    $scope.listSubjects = response.data;
    for (let i = 0; i < $scope.listSubjects.length; i += 8) {
      $scope.listSub = $scope.listSubjects.slice(i, i + 8);
      $scope.listSubDisplay.push($scope.listSub);
    }


    $scope.displayCourses = ($scope.listSubDisplay.slice(0, 1))[0];

    for (let i = 0; i < $scope.listSubDisplay.length; i++) {
      $scope.pageNumbers.push(i);
    }

    $scope.getSubId = function (index) {
      $scope.subId = index;
      console.log($scope.subId);
    }

  });

  $scope.pagination = function (index) {
    console.log($scope.listSubDisplay.slice(index, index + 1));
    $scope.displayCourses = ($scope.listSubDisplay.slice(index, index + 1))[0];
  }
});

// home-controller
app.controller("homeController", function ($scope, $http) {
  $scope.announcements = [];
  $http.get("./db/Announcements.js").then(function (response) {
    return ($scope.announcements = response.data);
  });
});

app.controller('testingController', function ($scope, $http, $routeParams, quizFactory) {
  $http.get('./db/Quizs/' + $routeParams.id + '.js').then(function (respon) {
    quizFactory.question = respon.data;
  });
});

// loginController
app.controller("loginController", function ($scope, $rootScope, dataService) {
  $scope.users = [];
  $scope.userLogin = {};
  $scope.isSuccess = false;
  $scope.isClose = false;
  $scope.currentUserInfo = {};

  dataService.getData().then(function (response) {
    $scope.users = response.data;
    $rootScope.$broadcast('listUser', $scope.users);
  });

  $scope.$on('userInfo', function(event, args) {
    $scope.currentUserInfo =  args;
  });

  $scope.closed = function () {
    var blurDiv = document.querySelector('.modal-backdrop');
    var bodyNode = document.querySelector('body');
    $scope.isClose = true;
    blurDiv.remove();
    bodyNode.classList.remove('modal-open')
    location.reload();
    location = "#/!"
  }

  $scope.checkAccount = function () {
    $scope.status = 0;
    for (let i = 0; i < $scope.users.length; i++) {
      if ($scope.userLogin.email === $scope.users[i].email) {
        if ($scope.userLogin.password === $scope.users[i].password) {
          localStorage.setItem("currentUser", JSON.stringify($scope.userLogin));
          localStorage.setItem('currenrUserInfo',JSON.stringify($scope.users[i]));
          $scope.isSuccess = true;
        } else {
          $scope.status = 1;
        }
        break;
      } else {
        $scope.status = 2;
      }
    }
  }

  $scope.changePath = function () {
    location = "#!forgetPass";
  }

});

app.controller("headerController", function ($scope, $rootScope) {
  $scope.listUsers = [];
  $scope.userLogin = {};
  $scope.currentUserInfo = {};
  $scope.isLogin = false;

  $scope.checkUser = function () {
    $scope.$on('listUser', function (event, args) {
      $scope.listUsers = args;
      if (localStorage.getItem("currentUser") != null) {
        $scope.isLogin = !$scope.isLogin;
        $scope.currentUser = JSON.parse(localStorage.getItem("currentUser"));
        for (let i = 0; i < $scope.listUsers.length; i++) {
          if ($scope.currentUser.email == $scope.listUsers[i].email) {
            $scope.currentUserInfo = $scope.listUsers[i];
          }
        }
        $rootScope.$broadcast('userInfo', $scope.currentUserInfo);
      }
    });
  }


  $scope.checkLogin = function () {
    if (!$scope.isLogin) {
      alert('Bạn phải đăng nhập!')
    } else {
      location = "#!course"
    }
  }

  $scope.logout = function () {
    localStorage.clear();
    $scope.isLogin = !$scope.isLogin;
    location = "#/!";
    location.reload();
  }
});

app.controller("changePassController", function ($scope, $routeParams, dataService) {
  $scope.userPass = {};
  $scope.message = "Mật khẩu không chính xác";
  $scope.isOldPass = true;
  $scope.isDifficult = true;
  $scope.isSame = true;

  $scope.checkInput = function () {
    if ($scope.userPass.oldPass == $routeParams.password) {
      $scope.isOldPass = true;
      if ($scope.userPass.oldPass != $scope.userPass.newPass) {
        $scope.isDifficult = true;
        if ($scope.userPass.newPass == $scope.userPass.rePass) {
          $scope.isSame = true;
          dataService.updateData($routeParams.id, { "password": $scope.userPass.newPass }).then(function (respon) {
            if (confirm("Vui lòng đăng nhập lại để tiếp tục")) {
              location = "#/!";
              localStorage.clear();
            }
            $scope.save();
          }, function (err) {
            alert("failed");
          })
        } else {
          $scope.isSame = false;
          $scope.message = 'Mật khẩu nhập lại không đúng';
        }
      } else {
        $scope.isDifficult = false;
        $scope.message = 'Mật khẩu mới không được giống mật khẩu cũ';
      }
    } else {
      $scope.isOldPass = false;
      $scope.message = "Mật khẩu cũ không chính xác";
    }
  }
});

app.controller('updateAccountController', function($scope, $filter, dataService){
  $scope.imgName = null;
  $scope.show = false;
  $scope.formInfo = {};
  $scope.currentUserInfo = JSON.parse(localStorage.getItem("currenrUserInfo"));
  $scope.imgName = $scope.currentUserInfo.avatar;
  $scope.gender =  $scope.currentUserInfo.gender;
  $scope.fullname = $scope.currentUserInfo.fullname.split(' ');
  $scope.firstName = $scope.fullname[1];
  $scope.lastName = $scope.fullname[0];

  const inputElement = document.querySelector("#chooseFile");
  inputElement.addEventListener("change", function(event) {
      $scope.imgName = event.target.files[0].name;
      $scope.show = !$scope.show;
  })

  $scope.showDropdown = function() {
    $scope.show = !$scope.show;
  }

  $scope.uploadFile = function(){

      if($scope.myFile) {
        $scope.imgName = $scope.myFile.name;
      }else {
        $scope.imgName = $scope.currentUserInfo.avatar;
      }

      var infoUpdating = {
      // id: $scope.currentUserInfo.id,
      password: $scope.currentUserInfo.password,
      email: $scope.email,
      fullname: $scope.lastName + " " + $scope.firstName,
      gender: $scope.gender,
      phone: $scope.phone,
      birthday: $scope.birthday,
      address : $scope.address,
      note: $scope.notes,
      marks: $scope.currentUserInfo.marks,
      avatar: $scope.imgName
      }

      dataService.updateData($scope.currentUserInfo.id, JSON.stringify(infoUpdating)).then(function (respon) {
        if(confirm('Bạn có muốn lưu thay đổi không')) {
          alert('Vui lòng đăng nhập lại để tiếp tục');
          location = "#/!";
          localStorage.clear();
        }
      }, function (err) {
        alert("failed");
      });
  };  
});

app.controller('registerController', function($scope, dataService) {
  $scope.users = [];
  dataService.getData().then(function (response) {
    $scope.users = response.data;
  });
  
  $scope.checkPassConfirm = function(pass) {
    $scope.isSame = false;
    if(pass == $scope.password) {
      $scope.isSame = !$scope.isSame;
    }
    else {
      $scope.isSame = $scope.isSame;
    }
  }
  
  $scope.checkAccount = function() {
    $scope.message = "Vui lòng nhập email chính xác";
     $scope.isOk = false;
      for(let i = 0; i < $scope.users.length; i++) {
        if($scope.email === $scope.users[i].email) {
          $scope.isOk = !$scope.isOk;
          console.log($scope.isOk);
          $scope.message = "Email này đã tồn tại";
          break;
        }else {
          $scope.isOk = $scope.isOk;
        }
      }
  }

  $scope.createNewAccount = function() {
    if(!$scope.isOk && $scope.isSame) {
      var newAccount = {
        password: $scope.password,
        email: $scope.email,
        fullname: $scope.fullname,
        gender: "",
        phone: "",
        birthday: "",
        address: "",
        note: "",
        marks: 0,
        avatar: ""
      }

      dataService.postData(newAccount).then(function(respon) {
        alert('Đăng ký thành công. Hãy đăng nhập để trải nghiệm');
      })
    }else {
      console.log($scope.isOk);
    }
  }
});

app.controller('forgetPassController', function($scope) {
  
});


app.service('dataService', function ($http) {
  delete $http.defaults.headers.common['X-Requested-With'];
  this.getData = function () {
    return $http.get('http://localhost:3000/listUsers');
  }
  
  this.updateData = function (id, data) {
    return $http.patch('http://localhost:3000/listUsers/' + id, data);
  }
  
  this.postData = function(data) {
      return $http.post('http://localhost:3000/listUsers/', data);
    }
});
  
app.directive('fileModel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        
        element.bind('change', function() {
          scope.$apply(function() {
            modelSetter(scope, element[0].files[0]);
          });
        });
      }
    };
}]);
  
app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
      var fd = new FormData();
      fd.append('file', file);
      $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
      .success(function(){
      })
      .error(function(){
      });
    }
}]);
  
  
 








