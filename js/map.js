
var promises = [];
promises.push(d3.json('main/map.json'));
promises.push(d3.csv("main/data.csv"));

Promise.all(promises).then(function(values) {
    const geojson = values[0];
    const csv = values[1];
    console.log(geojson);
    console.log(csv);

    const width = 850, 
    height = 800,
    colors = ['#d4eac7', '#c6e3b5', '#b7dda2', '#a9d68f', '#9bcf7d', '#8cc86a', '#7ec157', '#77be4e', '#70ba45', '#65a83e', '#599537', '#4e8230', '#437029', '#385d22', '#2d4a1c', '#223815'];

    const path = d3.geoPath();

    const projection = d3.geoMercator()
        .center([2.454071, 46.279229])
        .scale(3000)
        .translate([width / 2, height / 2]);

    path.projection(projection);

    const svg = d3.select('#map').append("svg")
        .attr("id", "svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "Blues");

    // Append the group that will contain our paths
    const deps = svg.append("g");
        
    var features = deps
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr('id', function(d) {return "d" + d.properties.CODE_DEPT;})
        .attr("d", path);

    var quantile = d3.scaleQuantile()
        .domain([0, d3.max(csv, function(e) { return +e.AIDES; })])
        .range(colors);

    var legend = svg.append('g')
        .attr('transform', 'translate(725, 150)')
        .attr('id', 'legend');
        
        legend.selectAll()
            .data(d3.range(colors.length))
            .enter().append('svg:rect')
                .attr('height', '20px')
                .attr('width', '20px')
                .attr('x', 5)
                .attr('y', function(d) { return d * 20; })
                .style("fill", function(d) { return colors[d]; });
                
    var legendScale = d3.scaleLinear()
        .domain([0, d3.max(csv, function(e) { return +e.AIDES; })])
        .range([0, colors.length * 20]);
            
    var legendAxis = svg.append("g")
        .attr('transform', 'translate(750, 150)')
        .call(d3.axisRight(legendScale).ticks(12));
            
    csv.forEach(function(e,i) {
        d3.select("#d" + e.CODE_DEPT)
            .style("fill", function(d) { return quantile(+e.AIDES); })
            .on("mouseover", function(d) {
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);
                div.html("<b>Région : </b>" + e.NOM_REGION + "<br>"
                        + "<b>Département : </b>" + e.NOM_DEPT + "<br>"
                        + "<b>Aides par l'Etat : </b>" + e.AIDES + "<br>")
                    .style("left", (d3.event.pageX + 30) + "px")     
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function(d) {
                div.style("opacity", 0);
                div.html("")
                    .style("left", "-500px")
                    .style("top", "-500px");
            });
    });

    // Append a DIV for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

});
