const
	configs  = {
		item: {
			width: 80,
			height: 80,
			idLen: 5,
			all: []
		},
		box: {
			cols: 11,
			rows: 12
		},
		showBeside: true,
		wind: {},
		isMd: false,
		coords: {
			nowX: 0,
			nowY: 0
		},
		menu: {
			last: ''
		}
	},
	selected = {
		last: null,
		_current: null,
		beside: {
			up: null,
			down: null,
			left: null,
			right: null
		},
		get current()
		{
			return this._current;
		},
		set current( val )
		{
			if ( this._current !== null ) this.last = this._current;
			this._current = val;

			const
				foundBeside = findBeside({
					row: this._current.elem.row,
					col: this._current.elem.col
				});

			if ( !foundBeside.found || !configs.showBeside ) return;

			for ( let key in foundBeside )
			{
				if ( this.beside.hasOwnProperty(key) )
				{
					if ( foundBeside[key].found )
					{
						delete foundBeside[key].found;

						this.beside[key] = foundBeside[key];
					}
					else
					{
						this.beside[key] = null;
					}
				}
			}
		}
	};

configs.wind.width = window.innerWidth;
configs.wind.height = window.innerHeight;

if ( !configs.box.cols )
{
	configs.box.cols = Math.round(configs.wind.width / configs.item.width);
}

if ( !configs.box.rows )
{
	configs.box.rows = Math.round(configs.wind.height / configs.item.height);
}

configs.box.width = configs.box.cols * configs.item.width;
configs.box.height = configs.box.rows * configs.item.height;

if ( configs.box.width < configs.wind.width )
{
	configs.box.width += configs.item.width;
	configs.box.cols++;
}

configs.item.count = configs.box.cols * configs.box.rows;
configs.item.current_count = 0;

let
	gridMap  = document.querySelector('#map'),
	gridBox  = document.querySelector('.grid-box'),
	pageBody = document.querySelector('body');

gridBox.style.cssText = `
	width: ${configs.box.width}px;
	height: ${configs.box.height}px;
`;

while ( configs.item.current_count < configs.item.count )
{
	configs.item.current_count++;

	let
		itemHTML = document.createElement('div'),
		itemId   = genId(configs.item.idLen),
		itemRow  = 1,
		itemCol  = 1;

	if ( configs.box.rows < configs.item.current_count )
		itemRow = Math.ceil(configs.item.current_count / configs.box.rows);

	if ( configs.box.cols >= configs.item.current_count )
		itemCol = configs.item.current_count;
	else
		itemCol = configs.item.current_count - ((itemRow - 1) * configs.box.cols);

	itemHTML.classList.add('item');
	itemHTML.id = itemId;
	itemHTML.style.cssText = `
		width: ${configs.item.width}px;
		height: ${configs.item.height}px;
	`;

	itemHTML.addEventListener('click', doElem);

	gridBox.appendChild(itemHTML);

	configs.item.all.push({
		id: itemId,
		target: itemHTML,
		col: itemCol,
		row: itemRow,
		game: {
			build: null,
			createdTime: NaN
		}
	});
}

configs.wind.scrollX = pageBody.scrollWidth;
configs.wind.scrollY = pageBody.scrollHeight;

configs.wind.mx = configs.wind.scrollX - configs.wind.width;
configs.wind.my = configs.wind.scrollY - configs.wind.height;

document.addEventListener('mousedown', function(e) {

	let
		moveActiveState = false;

	for (var i = 0; i < e.path.length; i++)
	{
		let
			targetItemClasses = e.path[i].classList;

		if ( targetItemClasses )
		{
			if ( targetItemClasses.contains('active-move-map') )
			{
				moveActiveState = true;
			}
		}		
	}

	if ( e.which == 1 && moveActiveState )
	{
		configs.isMd = true;

		configs.coords.curX = e.clientX;
		configs.coords.curY = e.clientY;		
	}
	
});

document.addEventListener('mouseup', function(e) {

	if ( e.which == 1 )
	{
		configs.isMd = false;

		configs.coords.nowX = configs.coords.lastX | 0;
		configs.coords.nowY = configs.coords.lastY | 0;

		pageBody.classList.remove('move-map');
	}
	
});

document.ondragstart = function()
{
	return false;
}

document.addEventListener('mousemove', function(e) {

	if ( configs.isMd )
	{
		pageBody.classList.add('move-map');
		
		let
			spaceX  = e.clientX - configs.coords.curX,
			spaceY  = e.clientY - configs.coords.curY,
			xPosNow = configs.coords.nowX + spaceX,
			yPosNow = configs.coords.nowY + spaceY;

		if ( xPosNow < -configs.wind.mx )
		{
			xPosNow = -configs.wind.mx;
		}
		else if ( xPosNow > 0 )
		{
			xPosNow = 0;
		}
		
		configs.coords.lastX = xPosNow;

		requestAnimationFrame(function animMoveX() {

			gridMap.style.left = xPosNow + 'px';

			requestAnimationFrame(animMoveX);

		});

		if ( yPosNow < -configs.wind.my )
		{
			yPosNow = -configs.wind.my;
		}
		else if ( yPosNow > 0 )
		{
			yPosNow = 0;
		}
		
		configs.coords.lastY = yPosNow;

		requestAnimationFrame(function animMoveY() {

			gridMap.style.top = yPosNow + 'px';

			requestAnimationFrame(animMoveY);

		});
	}
	
});

$('.menu-item').on('click', function() {

	if ( !selected.current ) return;

	let
		build = {
			val: this.dataset.val,
			params: this.dataset.val.split(':')
		};

	configs.menu.last = build.val;

	if ( selected.current.elem.game.build )
	{
		if ( selected.current.elem.game.build.val === build.val ) return;
		if ( !confirm('ЗДАНИЕ БУДЕТ ПЕРЕСТРОЕНО :")') ) return;

		$(selected.current.elem.target).removeClass(selected.current.elem.game.build.params);
	}

	selected.current.elem.game.build = build;
	selected.current.elem.game.createdTime = Date.now();

	$(selected.current.elem.target).addClass(selected.current.elem.game.build.params);

	console.log(this.dataset.val);

});

function findId( id )
{
	const
		returnObj = {
			idx: NaN,
			elem: null,
			found: false
		};

	configs.item.all.forEach((e, i) => {

		if ( e.id === id )
		{
			returnObj.idx = i;
			returnObj.elem = e;
			returnObj.found = true;
			return;
		}

	});

	return returnObj;
}

function findColRow( { col, row } )
{
	const
		returnObj = {
			idx: NaN,
			elem: null,
			found: false
		};

	configs.item.all.forEach((e, i) => {

		if ( +e.col === +col && +e.row === +row )
		{
			returnObj.idx = i;
			returnObj.elem = e;
			returnObj.found = true;
			return;
		}

	});

	return returnObj;
}

function findBeside( { col, row } )
{
	const
		returnObj = {
			up: findColRow({ col: col, row: row - 1 }),
			down: findColRow({ col: col, row: row + 1 }),
			left: findColRow({ col: col - 1, row: row }),
			right: findColRow({ col: col + 1, row: row }),
			found: false
		};

	for ( let key in returnObj )
		if ( key !== 'found' && returnObj[key].found ) returnObj.found = true;

	return returnObj;
}

function doElem()
{
	if ( selected.current )
		if ( this.id === selected.current.elem.id ) return;

	const
		foundElem = findId(this.id);

	if ( foundElem.found !== true ) return;

	delete foundElem.found;

	$('#map .item').removeClass('active');
	$(foundElem.elem.target).addClass('active');

	selected.current = foundElem;

	console.log(selected);

	if ( !configs.showBeside ) return;

	$('#map .item').removeClass('beside');

	for ( let key in selected.beside )
	{
		if ( selected.beside[key] )
			$(selected.beside[key].elem.target).addClass('beside');
	}
}