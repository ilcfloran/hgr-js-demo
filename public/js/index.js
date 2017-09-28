import '../css/site.css';
//import dgram from 'dgram';

import numeral from 'numeral';

const tagValue = numeral(20).format('$0,0.00');
console.log(`Tag price is ${tagValue} for normal tags.`);

