var data;

var xhr = new XMLHttpRequest();
var url = 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97';
xhr.open('get', url, true);
xhr.onload = mainFn;
xhr.send();


function mainFn() {
  data = JSON.parse(xhr.response).result.records;
  console.log(data)

  // DOM
  var resultContent = document.querySelector('.result-content');
  var zoneSelect = document.querySelector('#zoneSelect');
  var hotTagList = document.querySelector('.hot > ul');
  var pageContent = document.querySelector('.page-content');
  var goTopBtn = document.querySelector('#goTop');

  // Render Select
  var allZone = [];
  for (var i = 0; i < data.length; i++) {
    if (i === 0) {
      allZone.push(data[i].Zone);
    } else {
      var repeat = false;

      for (var j = 0; j < allZone.length; j++) {
        if (allZone[j] === data[i].Zone) {
          repeat = true;
          break;
        }
      }

      if (!repeat) {
        allZone.push(data[i].Zone);
      }
    }
  }

  var ALL_ZONE_TEXT = '全部行政區';
  var zoneOptionStr = '<option value="" selected>' + ALL_ZONE_TEXT + '</option>';
  for (var i = 0; i < allZone.length; i++) {
    zoneOptionStr += '<option value="' + allZone[i] + '">' + allZone[i] + '</option>';
  }
  zoneSelect.innerHTML = zoneOptionStr;


  // 區域過濾器
  function zoneFilter(zoneName) {
    if (zoneName === '') {
      return data;
    } else {
      return data.filter(function (obj) {
        return obj.Zone === zoneName;
      })
    }
  }

  var NOW_PAGE;
  var PAGE_SHOW_NUM = 10;
  var filterData

  function renderResult(zoneName) {
    document.querySelector('.zoneTitle > h2').textContent = zoneName || ALL_ZONE_TEXT;
    filterData = zoneFilter(zoneName);

    pageRender(filterData);
    renderSinglePage(1);
  }

  function renderSinglePage(pageNum) {
    NOW_PAGE = pageNum;
    var renderStr = '';

    for (var i = (pageNum - 1) * PAGE_SHOW_NUM; i < pageNum * PAGE_SHOW_NUM; i++) {
      var nowData = filterData[i];
      if (nowData === undefined) { break; }
      var phone = '+' + nowData.Tel.split('-').join('');
      var free = nowData.Ticketinfo !== '' ? '<p class="free">' + nowData.Ticketinfo + '</p>' : '';

      renderStr += '<div class="result-item"><header style="background-image: url(' + nowData.Picture1 + ');"><div class="summary"><p>' + nowData.Name + '</p><span>' + nowData.Zone + '</span></div></header><div class="info"><p class="time">' + nowData.Opentime + '</p><a class="address" target="_blank" href="https://www.google.com.tw/maps/search/' + nowData.Name + '">' + nowData.Add + '</a><div><a class="phone" href="tel:' + phone + '">' + nowData.Tel + '</a>' + free + '</div></div></div>';
    }

    resultContent.innerHTML = renderStr;
  }

  var prevBtn;
  var nextBtn;
  // 換頁按鈕渲染
  function pageRender(data) {
    var pageNum = Math.ceil(data.length / 10);
    var prevBtnTemp = '<button data-page-btn="prev" class="prevBtn disable">< prev</button>';
    var nextBtnTemp = '<button data-page-btn="next" class="nextBtn">next ></button>';
    var pageStr = '';

    if (pageNum !== 1) {
      pageStr += prevBtnTemp;
      for (var i = 0; i < pageNum; i++) {
        var className = DIS_CLASS_NAME;
        if (i !== 0) { className = ''; }
        pageStr += '<button class="' + className + '">' + (i + 1) + '</button>';
      }
      pageStr += nextBtnTemp;
    } else {
      pageStr = '';
    }

    pageContent.innerHTML = pageStr;
    prevBtn = document.querySelector('.prevBtn');
    nextBtn = document.querySelector('.nextBtn');
  }

  function setPageBtnClass(pageNum) {
    var allBtn = pageContent.querySelectorAll('button');
    for (var i=0; i<allBtn.length; i++) {
      allBtn[i].classList.remove(DIS_CLASS_NAME)
      if (i === pageNum) {
        allBtn[i].classList.add(DIS_CLASS_NAME);
      }
    }

    if (pageNum === 1) {
      allBtn[0].classList.add(DIS_CLASS_NAME);
    }
    if (pageNum === allBtn.length-2) {
      allBtn[allBtn.length-1].classList.add(DIS_CLASS_NAME);
    }
  }



  zoneSelect.addEventListener('change', function (evt) {
    renderResult(evt.target.value);
  });

  hotTagList.addEventListener('click', function (evt) {
    if (evt.target.nodeName !== 'LI') {
      return;
    }
    var nowZone = evt.target.textContent;
    zoneSelect.value = nowZone;
    renderResult(nowZone);
  });

  goTopBtn.addEventListener('click', function () {
    window.scrollTo(0, 0);
  });

  var DIS_CLASS_NAME = 'disable';
  pageContent.addEventListener('click', function (evt) {
    var target = evt.target;
    var pageNum = parseInt(target.textContent);
    if (target.nodeName !== 'BUTTON' || target.getAttribute('class') === DIS_CLASS_NAME) {
      return;
    }

    var finalPageNum = Math.ceil(filterData.length / 10);

    // 如果是點擊 數字 的話
    if (!isNaN(pageNum)) {
      if (pageNum === 1) {
        prevBtn.classList.add(DIS_CLASS_NAME);
      } else if (pageNum === finalPageNum) {
        nextBtn.classList.add(DIS_CLASS_NAME);
      }
    } else {
      var dir = target.dataset.pageBtn === 'prev' ? -1 : 1;
      
      if (NOW_PAGE + dir === 0 || NOW_PAGE + dir > finalPageNum) {
        return;
      } else {
        pageNum = NOW_PAGE + dir;
      }
    }
    
    NOW_PAGE = pageNum;
    location.href = "#result";
    setPageBtnClass(pageNum);
    renderSinglePage(pageNum);
  });



  // Init
  renderResult('');
};