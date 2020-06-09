$("#checkFileBtn").click(function(){
    var files = $("#checkFile").prop('files');
    if(files.length == 0){
        alert('请选择文件');
        return;
    }else{
        var reader = new FileReader();//新建一个FileReader
        reader.readAsText(files[0]);//读取文件
        reader.onload = function(e){ //读取完文件之后会回来这里
            var relArr = e.target.result.split("\r\n");
            console.log(relArr);
            $.post("bluepage/searchEmployee",
                {data : relArr},
                function(data,status){
                    alert(data);
            });
        }
    }
});
