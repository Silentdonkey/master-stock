var bgColor = "#fff";//背景
var upColor = "#ff0000";//涨颜色--红色
var downColor = "#008b00";//跌颜色--绿色
var labelColor = "#333"; //文字颜色--灰色
var borderColor = "#bebebe"; // 图标边框色，会影响坐标轴上悬浮框的背景色
// ma  颜色
var ma5Color = "#39afe6"; //--浅蓝
var ma10Color = "#da6ee8";//--偏紫色
/**
 * 15:20 时:分 格式时间增加num分钟
 * @param {Object} time 起始时间
 * @param {Object} num
 */
function addTimeStr(time, num) {
  var hour = time.split(':')[0];
  var mins = Number(time.split(':')[1]);
  var mins_un = parseInt((mins + num) / 60);
  var hour_un = parseInt((Number(hour) + mins_un) / 24);
  if (mins_un > 0) {
    if (hour_un > 0) {
      var tmpVal = ((Number(hour) + mins_un) % 24) + "";
      hour = tmpVal.length > 1 ? tmpVal : '0' + tmpVal;//判断是否是一位-->09:30/21:30
    } else {
      var tmpVal = Number(hour) + mins_un + "";
      hour = tmpVal.length > 1 ? tmpVal : '0' + tmpVal;
    }
    var tmpMinsVal = ((mins + num) % 60) + "";
    mins = tmpMinsVal.length > 1 ? tmpMinsVal : 0 + tmpMinsVal;//分钟数为 取余60的数
  } else {
    var tmpMinsVal = mins + num + "";
    mins = tmpMinsVal.length > 1 ? tmpMinsVal : '0' + tmpMinsVal;//不大于整除60
  }
  return hour + ":" + mins;
}

//获取增加指定分钟数的 数组  如 09:30增加2分钟  结果为 ['09:31','09:32'] 
function getNextTime(startTime, endTIme, offset, resultArr) {
  var result = addTimeStr(startTime, offset);
  resultArr.push(result);//在数组后面新增一个时间点-->09:32
  if (result == endTIme) {
    return resultArr;
  } else {
    return getNextTime(result, endTIme, offset, resultArr);
  }
}


/**
 * 不同类型的股票的交易时间会不同  
 * @param {Object} type   hs=沪深  us=美股  hk=港股
 */

 /*直接定为hs=沪深 */
 var time_arr = function (type) {
  if (type.indexOf('hs') != -1) {//生成沪深时间段
    var timeArr = new Array();
    timeArr.push('09:30');
    timeArr.concat(getNextTime('09:30', '11:30', 1, timeArr));
    timeArr.push('13:00');
    timeArr.concat(getNextTime('13:00', '15:00', 1, timeArr));
    return timeArr;
  }
}


/*
var time_arr = function (type) {
  if (type.indexOf('us') != -1) {//生成美股时间段
    var timeArr = new Array();
    timeArr.push('09:30')
    return getNextTime('09:30', '16:00', 1, timeArr);
  }
  if (type.indexOf('hs') != -1) {//生成沪深时间段
    var timeArr = new Array();
    timeArr.push('09:30');
    timeArr.concat(getNextTime('09:30', '11:30', 1, timeArr));
    timeArr.push('13:00');
    timeArr.concat(getNextTime('13:00', '15:00', 1, timeArr));
    return timeArr;
  }
  if (type.indexOf('hk') != -1) {//生成港股时间段
    var timeArr = new Array();
    timeArr.push('09:30');
    timeArr.concat(getNextTime('09:30', '11:59', 1, timeArr));
    timeArr.push('13:00');
    timeArr.concat(getNextTime('13:00', '16:00', 1, timeArr));
    return timeArr;
  }

}
*/

var get_m_data = function (m_data, type) {//m_data--分时数据
  var priceArr = new Array();
  var vol = new Array();
  var times = time_arr(type);
  $.each(m_data.data, function (i, v) {
    priceArr.push(v[1]);
    vol.push(v[2]); //目前数据没有均价，取值提前一位
  })
  return {
    priceArr: priceArr,//--当前价
    vol: vol,//--涨幅
    times: times //--成交量
  }
}


//分时图 option

/**
 * 生成分时option 
 * @param {Object} m_data 分时数据
 * @param {Object} type 股票类型  us-美股  hs-沪深  hk-港股
 */

function initMOption(m_data, type) {
  var m_datas = get_m_data(m_data, type);

  var baseNumber = Number(m_data.yestclose).toFixed(2)
  var _minVal =  Number(baseNumber-baseNumber*handle_num()).toFixed(2);
  var _maxVal = (Number(baseNumber)+baseNumber*handle_num()).toFixed(2);
  var _interval =  Math.abs(Number((baseNumber - _minVal)/5));//--间隔

  function handle_num(){
    var _aa = Math.abs((Math.max.apply(null, m_datas.priceArr)-baseNumber)/baseNumber).toFixed(2);
    var _bb = Math.abs((baseNumber-Math.min.apply(null, m_datas.priceArr))/baseNumber).toFixed(2);
    return _aa>_bb ? _aa:_bb;//--三目运算符，若成立执行前面，否则后面；
  }

  function format_y(v) {
    v = v.toFixed(2)
    if (v > m_data.yestclose) {//--昨日收盘价
        return '{red|' + v + '}'; //--涨幅为正，显示红色，否则为绿色
    }else if (v == baseNumber) {
        return v;
    }else{
      return '{green|' + v + '}';
    }
  }
  return {
    tooltip: { //弹框指示器
      trigger: 'axis',//--触发类型
      backgroundColor: "#f1f1f1",//--提示背景颜色
      borderColor: "#ccc",//--提示边框颜色
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      axisPointer: {// --坐标轴指示器，坐标轴触发有效
        type: 'cross',// 默认为直线，可选为：'line' | 'shadow'
        label: {
          show: true,
          backgroundColor: '#333'
        }
      },
      formatter: function (params, ticket, callback) {
        var i = params[0].dataIndex;
        var color;
        if (m_datas.priceArr[i] > m_data.yestclose) {
          color = 'style="color:' + upColor + '"'; //--涨颜色(红)
        } else {
          color = 'style="color:' + downColor + '"';//--跌颜色(绿)
        }
        var html = '<div class="commColor" style="width:100px;">\
                  <div>当前价 <span  '+ color + ' >' + m_datas.priceArr[i] + '</span></div>\
			            <div>涨幅 <span  '+ color + ' >' + ratioCalculate(m_datas.priceArr[i], m_data.yestclose) + '%</span></div>\
				          <div>成交量 <span  '+ color + ' >' + m_datas.vol[i] + '</span></div></div>';
        return html;
      }
    },
    legend: { //图例控件,点击图例控制哪些系列不显示
      icon: 'rect',//--方形图标
      type: 'scroll',//--'scroll'：可滚动翻页的图例。当图例数量较多时可以使用
      itemWidth: 14,//--图例标记的图形宽度。
      itemHeight: 2,
      selectedMode:false,//--图例选择的模式，控制是否可以通过点击图例改变系列的显示状态。默认开启图例选择，可以设成 false 关闭
      left: 0,//--图例组件离容器左侧的距离。
      top: '1%',
      textStyle: {
        fontSize: 12,
        color: labelColor //--要改颜色注意'red'
      }
    },
    color: [ma5Color, ma10Color],
    grid: [{
      show: true,//--是否显示直角坐标系网格。
      borderColor: borderColor,//--网格的边框颜色。支持的颜色格式同 backgroundColor(前提是，设置了 show: true)
      id: 'gd1', //--组件 ID。默认不指定。指定则可用于在 option 或者 API 中引用组件
      height: '63%', //主K线的高度,--grid 组件的高度。默认自适应。
      top: '9%' //--grid 组件离容器上侧的距离。
    },{
      show: true,
      borderColor: borderColor,
      id: 'gd2',
      top: '9%',
      height: '63%' //主K线的高度,
    },
     {
      show: true,
      borderColor: borderColor,
      id: 'gd3',
      top: '76%',
      height: '19%' //交易量图的高度
    }],
    xAxis: [ //==== x轴
      { //主图 
        gridIndex: 0, //--x 轴所在的 grid 的索引，默认位于第一个 grid。
        boundaryGap: false,//--坐标轴两边留白策略，类目轴和非类目轴的设置和表现不一样
        axisTick: {
          show: false
        },
        axisLine: {//--坐标轴轴线相关设置。
          lineStyle: {
            color: borderColor,//--坐标轴线线的颜色。
          }
        },
        data: m_datas.times,
        axisLabel: { //label文字设置--坐标轴刻度标签的相关设置
          show: false//--是否显示刻度标签。
        },
        splitLine: { //分割线设置--坐标轴在 grid 区域中的分隔线。
          show: false,//--是否显示分隔线。默认数值轴显示(改为不显示)
          lineStyle: {
            type: 'dashed'//--分隔线线的类型。
          }
        },
      },
      {
        show: false,
        gridIndex: 1,
        boundaryGap: false,
        data: m_datas.times,
        axisLabel: { //label文字设置
          show: false
        },
        axisLine: {
          lineStyle: {
            color: borderColor,
          }
        },
      },
       { //交易量图
        splitNumber: 2,
        type: 'category',
        gridIndex: 2,
        boundaryGap: false,
        data: m_datas.times,
        axisLabel: { //label文字设置
          color: labelColor,
          fontSize: 10
        },
        axisTick: {//--坐标轴刻度相关设置。
          show: false
        },
        splitLine: { //分割线设置
          show: false,//--改为false
          lineStyle: {
            type: 'dashed'
          }
        },
        axisLine: {
          lineStyle: {
            color: borderColor,
          }
        }
      }
    ],
    yAxis: [ //y轴
      {
        type: 'value',//--'value' 数值轴，适用于连续数据
        min: _minVal,//--坐标轴刻度最小值。
        max: _maxVal,
        interval: _interval,//--强制设置坐标轴分割间隔。
        gridIndex: 0,//--y 轴所在的 grid 的索引，默认位于第一个 grid。
        scale: true,//--只在数值轴中（type: 'value'）有效。是否是脱离 0 值比例。设置成 true 后坐标刻度不会强制包含零刻度
        axisTick: { // 分割线 短--坐标轴刻度相关设置。
        show: false //--是否显示坐标轴刻度。
        },
        axisLine: {//--坐标轴轴线相关设置。
          lineStyle: {
            color: borderColor,//--坐标轴线线的颜色
          }
        },
        axisPointer: {
          show: true,
          label: {
            formatter: function (params) {//--文本标签文字的格式化器。
              return (params.value).toFixed(2);
            }
          }
        },
        axisLabel: {//--坐标轴刻度标签的相关设置。
          color:'#333',
          formatter: format_y,//--刻度标签的内容格式器，支持字符串模板和回调函数两种形式
          rich: {
            red: {
                color: 'red',
                lineHeight: 10
            },
            green: {
                color: 'green',
                lineHeight: 10
            }
          }
        },
        z: 4,//--Y 轴组件的所有图形的z值。控制图形的前后顺序。z值小的图形会被z值大的图形覆盖。
        splitLine: { //分割线设置
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        },
      },

      {
        scale: true,
        gridIndex: 1,
        min: _minVal,
        max: _maxVal,
        interval: _interval,
        position: 'right',
        z: 4,
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: borderColor,
          }
        },
        axisLabel: { //label文字设置
          color: function (val) {
            val = Number(val).toFixed(2)
            if (val == baseNumber) {
              return '#333'
            }
            return val > baseNumber ? upColor : downColor;
          },
          inside: false, //label文字朝内对齐--右侧坐标刻度朝外对齐
          formatter: function (val) {
            var resul = ratioCalculate(val, baseNumber);
            return Number(resul).toFixed(2) + '%'
          }
        },
        splitLine: { //分割线设置
          show: false,
          lineStyle: {
            color: '#181a23'
          }
        },
        axisPointer: {
          show: true,
          label: {
            formatter: function (params) { //计算右边Y轴对应的当前价的涨幅比例
              return ratioCalculate(params.value, baseNumber) + '%';
            }
          }
        }
      },
      { //交易图
        // name: '万',
        nameGap: '0',//--坐标轴名称与轴线之间的距离。
        nameTextStyle: {
          color: labelColor//--坐标轴名称的文字样式。
        },
        gridIndex: 2,
        z: 4,
        splitNumber: 3,
        axisLine: {
          onZero: false,//--X 轴或者 Y 轴的轴线是否在另一个轴的 0 刻度上，只有在另一个轴为数值轴且包含 0 刻度时有效。
          lineStyle: {
            color: borderColor,
          }
        },
        axisTick: {
          show: false//--分割线刻度
        },
        axisPointer: {
          show: false,
          label: {
            formatter: function (params) { //计算右边Y轴对应的当前价的涨幅比例
              var _p = ((params.value) / 10000).toFixed(1) + '万';
              return _p
            }
          }
        },
        splitLine: { //分割线设置
          show: false,//--中间刻度横线
        },
        axisLabel: { //label文字设置
          color: labelColor,
          inside: false, //label文字朝内对齐 
          fontSize: 10,
          onZero: false,
          formatter: function (params) { //计算右边Y轴对应的当前价的涨幅比例            
            var _p = (params / 10000).toFixed(1);
            if (params == 0) {
              _p = '(万)'
            }
            return _p
          }
        },
      }
    ],
    backgroundColor: bgColor,
    blendMode: 'source-over',//-- 图形的混合模式,支持每个系列单独设置。
    series: [{
      name: '当前价',
      type: 'line',
      data: m_datas.priceArr,
      smooth: true,
      symbol: "circle", //中时有小圆点 
      lineStyle: {
        normal: {
          opacity: 0.8,
          color: '#39afe6',
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0, 136, 212, 0.7)'//--填充的颜色
          }, {
            offset: 0.8,
            color: 'rgba(0, 136, 212, 0.02)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      markLine: {
        name:'昨日收盘价',
        symbol: ['none', 'none'],
        label:{
          show:false,
          formatter:  Number(m_data.yestclose).toFixed(2),
          position: 'start',
        },
        lineStyle: {
          color: '#4289c5',
          type: 'solid'
        },
        data: [{
          yAxis: m_data.yestclose,
        }]
      }
    },
    {
      type: 'line',
      data: m_datas.priceArr,
      smooth: true,
      symbol: "none",
      gridIndex: 1,
      xAxisIndex: 1,
      yAxisIndex: 1,
      lineStyle: { //标线的样式 
        normal: {
          width: 0
        }
      }
    },
    {
      name: '成交量',
      type: 'bar',
      gridIndex: 2,
      xAxisIndex: 2,
      yAxisIndex: 2,
      data: m_datas.vol,
      barWidth: '60%',
      itemStyle: {
        normal: {
          color: function (params) {
            var colorList;
            if (m_datas.priceArr[params.dataIndex] > m_datas.priceArr[params.dataIndex - 1]) {
              colorList = upColor;
            } else {
              colorList = downColor;
            }
            return colorList;
          },
        }
      }
    }
    ]
  };
}

/**
 * 计算价格涨跌幅百分比
 * @param {Object} price 当前价
 * @param {Object} yclose 昨收价
 */
function ratioCalculate(price, yclose) {
  return ((price - yclose) / yclose * 100).toFixed(2);
}

