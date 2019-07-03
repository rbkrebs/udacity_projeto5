		function collapse() {

			var sideBar = document.getElementById("mySidebar").offsetWidth;

			if(sideBar == 0){
				document.getElementById("mySidebar").style.width = "250px";
		  		document.getElementById("sectionMap").style.marginLeft = "265px";
		  		document.getElementById("nav").style.marginLeft = "250px";
			}
		 else{
		 	document.getElementById("mySidebar").style.width = "0";
		  document.getElementById("sectionMap").style.marginLeft= "15px";
		  document.getElementById("nav").style.marginLeft = "0";
		 }
		};