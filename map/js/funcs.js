function genId(len)
{
	var
		symsTxt = 'qazwsxedcrfvtgbyhnujmikolp',
		symsNum = '0123456789',
		txtLen  = symsTxt.length - 1,
		numLen  = symsNum.length - 1,
		ready   = '';

	while ( ready.length < len )
	{
		if ( rand(0, 1) && ready.length > 0 )
		{
			ready += symsNum[rand(0, numLen)];	
		}
		else
		{
			ready += symsTxt[rand(0, txtLen)];
		}
	}

	return ready;
}

function rand(min, max)
{
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}

function c(what) {
	console.log(what);
}