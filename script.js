let width = window.innerWidth;
let height = window.innerHeight;
const contactScale = d3.scaleLinear().domain([1,2,3]);
const colorScale = d3.scaleLinear().domain([1,2,3]);
const opacityScale = d3.scaleLinear().domain([1,2,3]);

var projection = d3.geoCylindricalEqualArea().parallel([45]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "map");

d3.queue()
  .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/2019-barg-density-map/master/oregon-counties.json')
  .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/2019-barg-density-map/master/2019barg.json')
  .await((error, or, contacts) => {

  if (error) console.log(error);

  var counties = topojson.feature(or, or.objects.cb_2015_oregon_county_20m);

  projection.scale(1)
    .translate([0, 0]);

  var b = path.bounds(counties),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection.scale(s)
    .translate(t);

  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(or, or.objects.cb_2015_oregon_county_20m).features)
    .enter().append("path")
    .attr("d", path);

  contactScale
    .range(["State Homecare", "State", "Higher Ed"]);

  const circleClass = ["State Homecare", "State", "Higher Ed"];

  colorScale
    .range(["#531078", "#ff8000", "#ffff00"]);
  opacityScale
    .range([1, .6, .3]);

  svg.append('g')
    .selectAll('.contact')
    .data(contacts)
    .enter().append('circle')
      .attr('class', 'contact')
      .attr('cx', d => {
        // console.log(d[2]);
        // console.log(d[1]);
        // console.log(d);
        // console.log(projection([d[2], d[1]]))
        return projection([d[2], d[1]])[0]
      })
      .attr('cy', d => projection([d[2], d[1]])[1])
      .attr("r",  3)
      .attr("id", d => `id${d[0]}`)
      .attr("class", (d) => `circle circle-${circleClass.indexOf(d[0])}`)
      .attr('fill', d => colorScale(d[0]))
      .style('opacity', d => opacityScale(d[0]));

});

const zoom = d3.zoom()
  .scaleExtent([0.5, 20])
  .on('zoom', () => {
    d3.selectAll('g').attr("transform", d3.event.transform);
    d3.selectAll("circle")
      .attr("r", (3 / d3.event.transform.k));
  });

d3.select("body").call(zoom);