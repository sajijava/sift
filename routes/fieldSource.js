/*
 * Source - souce of data
 * 	Q = quote
 * 	B = balance sheet
 * 	I = income statement
 * 	C = cashflow state,ent
 *
 * attribute - yahoo code for each data element
 *
 * desc - description
 *
 * type - data type
 *   C - Currency
 *   I - Integer
 *   P - Percent
 *   F - Fraction
 *   T - Text
 *
 * align - data default alignment
 *   L - Left
 *   R - Right
 *   C - Center
 * 
 **/

module.exports = {
		"ask":{"source":"Q", "attribute":"a","desc":"Ask","type":"C", "align":"R", "size":7},
		"avgVolume":{"source":"Q", "attribute":"a2","desc":"Average Daily Volume","type":"I", "align":"R", "size":11}, 	
		"bid":{"source":"Q", "attribute":"b","desc":"Bid","type":"C", "align":"R", "size":7},
		"bookValue":{"source":"Q", "attribute":"b4","desc":"Book Value","type":"C", "align":"R", "size":11}, 	
		"change":{"source":"Q", "attribute":"c1","desc":"Change","type":"C", "align":"R", "size":7}, 	
		"divPerShare":{"source":"Q", "attribute":"d","desc":"Dividend Per Share","type":"C", "align":"R", "size":7}, 	
		"close":{"source":"Q", "attribute":"l1","desc":"Last Trade","type":"C", "align":"R", "size":7},
		"symbol":{"source":"Q", "attribute":"s","desc":"Symbol","type":"T", "align":"L", "size":7}, 	
		"shares":{"source":"Q", "attribute":"s1","desc":"Shares Owned","type":"I", "align":"R", "size":11},
		"shortRatio":{"source":"Q", "attribute":"s7","desc":"Short Ratio","type":"P", "align":"R", "size":7}, 	
		"volume":{"source":"Q", "attribute":"v","desc":"Volume","type":"I", "align":"R", "size":11}
	
}