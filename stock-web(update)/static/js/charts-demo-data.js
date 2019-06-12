
// 分时数据  
var mdata= {
  "data":[]
}

function getmData(callback) { //分时图
  $.ajax({
    url: "http://data.gtimg.cn/flashdata/hushen/minute/sz000001.js?maxage=110&0.28163905744440854",
    dataType:"script",
    cache:"false",
    type:"GET",
    success: function () {
      // 目前分时图数据缺少均价
      var msg = min_data;
      var result = msg.replace(/\n/g,",").split(',')
      var arr = result.slice(2,result.length-1), //开头结尾各一个空数组要去掉
      _arr = [];
      for(var i=0;i<arr.length;i++){ 
        var _a = arr[i].split(" ") , _b = arr[i].split(" "), _c =[];
        if(i>0){
          _c = arr[i-1].split(" ");
        }
        // 腾讯股票接口传的数值0930（日期） 5.55（成交价） 37673（累计成交量，初始成交量为9:30的）
        // 因此每分钟的 成交量 = 当前累计成交量 - 前一分钟的累计成交量
        _b[2] = _c.length>0 ? _a[2] - _c[2] : _a[2];    
        _arr.push(_b)
      }
      mdata.data = _arr
      callback(mdata)
    },
    error: function () {
      alert("wrong"); 
    }
  });
}

function getInfo(callback){ //获取股票信息
  $.ajax({
    url: "http://hq.sinajs.cn/list=sz000001",
    dataType: "script",
    cache: "false",
    type: "GET",
    success: function(){
      var info = hq_str_sz000001;
      var _info_arr = info.split(",")
      callback(_info_arr)
    },
    error: function(){
      alert("查询信息失败")
    }
  })  
}
