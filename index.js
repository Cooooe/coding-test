/**
 * Created by KangHyungWon on 2017. 2. 6..
 */
var $http = (function () {

	var createXMLHttpRequest = function() {
		return new XMLHttpRequest();
	};

	var send = function(callback) {
		var xhr = createXMLHttpRequest();

		xhr.open('POST', './items.json', true);
		xhr.send();
		xhr.onreadystatechange = function() {
			if ( xhr.readyState == 4 && xhr.status == 200 ) {
				var result = xhr.responseText;

				// debugger;

				try {
					result = JSON.parse(result);
				} catch(e) {
					console.error(e);
					result = {
						status: 'ERROR'
					};
				}

				callback(result);
			}
		}
	};

	return {
		send: send
	};

})();

var $ui = (function(daum) {

	var setBuildingInfo = function(buildingInfo) {

		var buildingInfoElem = document.querySelector('.room-info.building-info'),
			buildingImageElem = buildingInfoElem.querySelector('.building-img > amp-img'),
			buildingAddressElem = buildingInfoElem.querySelector('#buildingAddress'),
			buildingNameElem = buildingInfoElem.querySelector('#buildingName'),
			buildingFloorElem = buildingInfoElem.querySelector('#buildingFloor'),
			buildingRoomsElem = buildingInfoElem.querySelector('#buildingRooms'),
			buildingEstablishElem = buildingInfoElem.querySelector('#buildingEstablish');

		var address = [];

		if ( buildingInfo.hasOwnProperty('address1') ) {
			address.push(buildingInfo.address1)
		}

		if ( buildingInfo.hasOwnProperty('address2') ) {
			address.push(buildingInfo.address2);
		}

		if ( buildingInfo.hasOwnProperty('address3') ) {
			address.push(buildingInfo.address3);
		}

		buildingImageElem.setAttribute('src', buildingInfo.img);
		buildingNameElem.textContent = buildingInfo.name;
		buildingAddressElem.textContent = address.join(' ');
		buildingFloorElem.textContent = buildingInfo.floor;
		buildingRoomsElem.textContent = buildingInfo.rooms;
		buildingEstablishElem.textContent = buildingInfo.established;

		$map.getGeocoding(address.join(' '), function(result) {
			$map.setDaumMap(result.lat, result.lng);
		});
	};

	return {
		setBuildingInfo: setBuildingInfo
	};

})(daum);

var $map = (function(daum) {

	var _drawManager;
	var _map;

	var setDaumMap = function(lat, lng) {
		var mapContainer = document.querySelector('#map');

		var options = { //지도를 생성할 때 필요한 기본 옵션
			center: new daum.maps.LatLng(lat, lng), //지도의 중심좌표.
			level: 3, //지도의 레벨(확대, 축소 정도),
			draggable: false
		};

		_map = new daum.maps.Map(mapContainer, options); //지도 생성 및 객체 리턴

		drawCenterRadius({
			map: _map,
			lat: lat,
			lng: lng
		});
	};

	var getGeocoding = function(address, callback) {

		var geocoder = new daum.maps.services.Geocoder();

		var _callback = function(status, result) {
			if (status === daum.maps.services.Status.OK) {
				callback(result.addr[0]);
			}
		};

		// debugger;

		geocoder.addr2coord(address, _callback);
	};

	var drawCenterRadius = function(mapOptions) {
		if ( !_drawManager ) {

			var drawManagerOptions = {
				map: mapOptions.map,
				drawingMode: [
					daum.maps.drawing.OverlayType.CIRCLE
				],
				circleOptions: {
					draggable: false,
					removable: false,
					editable: false,
					strokeColor: '#f3ad78',
					strokeWeight:1,
					fillColor: '#f3ad78',
					fillOpacity: 0.5
				}
			};

			_drawManager = new daum.maps.drawing.DrawingManager(drawManagerOptions);
		}

		var center = new daum.maps.LatLng(mapOptions.lat, mapOptions.lng);

		// 그리기 관리자에 원을 추가한다. 반지름은 50으로 정한다
		_drawManager.put(daum.maps.drawing.OverlayType.CIRCLE, center, 25);

	};

	return {
		setDaumMap: setDaumMap,
		getGeocoding: getGeocoding
	};

})(daum);

var initialize = (function($http, daum) {

	var setScreen = function() {
		getBuildingData();

		// $map.setDaumMap();
	};

	var setEvent = function() {
		var callBtn = document.querySelector('#callBtn'),
			roomImg = document.querySelectorAll('#imageContainer amp-img'),
			roomImgCount = roomImg.length;

		// 전화걸기 Event
		callBtn.addEventListener('click', function() {
			var callNumber = document.querySelector('#callNumberView').textContent;
			callNumber = callNumber.replace(/[\-]/gi, '');
			window.location.href="tel://"+callNumber;
		});

		for ( var i = 0; i < roomImgCount; i ++ ) {
			roomImg[i].addEventListener('click', function() {
				// alert('a');
			});
		}
	};

	var getBuildingData = function() {
		$http.send(function(receivedData) {

			var roomList = receivedData.datas,
				roomListCount = roomList.length,
				roomListItem;

			var buildingInfo;

			for ( var i = 0;i < roomListCount; i ++ ) {

				roomListItem = roomList[i];

				buildingInfo = roomListItem.building;

				$ui.setBuildingInfo(buildingInfo);
			}
		});
	};

	return {
		setScreen: setScreen,
		setEvent: setEvent
	}

})($http);


(function() {
	initialize.setScreen();
	initialize.setEvent();
})();