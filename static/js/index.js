$(function(){
//轮播图
//保存图片的路径
var baseUrl = "../static/images/index/";
var arr = ["index_banner1.png",
            "index_banner2.png",
            "index_banner3.png"
            ];
 var index=0;
 var timer = setInterval(autoPlay,2000);
 function autoPlay(){
    //索引对应颜色状态更改
    $("#banner ul>li").eq(index).css("background","#fff");
    index++;
    if(index == arr.length){
        index = 0;//下标清零
    }
    var url = baseUrl + arr[index];
    $("#banner a>img").attr("src",url);
    //索引对应修改
    $("#banner ul>li").eq(index).css("background","#666666");
 }
 //鼠标移入移出
 $("#banner").mouseover(function(){
    //鼠标移入，停止计时器
    clearInterval(timer);
 }).mouseout(function(){
    //鼠标移出，重启计时器
    timer = setInterval(autoPlay,2000);
 })
 //前后翻,图片
 $("#banner .left").click(function(){
    $("#banner ul>li").eq(index).css("background","#fff");
    index--;
    if(index==-1){
        index=arr.length-1;//前翻,索引越界
    }
    var url=baseUrl + arr[index];
    $("#banner ul>li").eq(index).css("background","#666666");
 })
 $("#banner .right").click(function(){
    autoPlay();
 })
 //遍历li,添加属性ind
 for(var i=0;i<arr.length;i++){
    //为对象添加ind属性,表示下标
    $("#banner ul>li")[i].ind = i;
 }

 $("#banner ul>li").click(function(){
    $("#banner ul>li").css("background","#fff");
    index = this.ind;
    var url = baseUrl +arr[index];
    $("#banner ul>li").eq(index).css("background","#666666");
 });

 // Echarts图显示设置
 // 第二步: 初始化echart对象
    var mChart = echarts.init(document.getElementById('m-line'));
    getmData(function(res){ //分时图
      getInfo(function(res2){ //获取股票信息
        res.yestclose = res2[2] //昨日收盘价
        mChart.setOption(initMOption(res, 'hs'));//生成分时option; m_data 分时数据/type 股票类型
      })
    })
})














