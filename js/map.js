
var promises = [];
promises.push(d3.json('https://raw.githubusercontent.com/FrankFacundo/JournalismeDatavis/main/map.json'));
promises.push(d3.csv("https://raw.githubusercontent.com/FrankFacundo/JournalismeDatavis/main/data.csv"));

Promise.all(promises).then(function(values) {
    const geojson = values[0];
    const csv = values[1];
    console.log(geojson);
    console.log(csv);

    const width = 850, 
    height = 800,
    //colors = ['#d4eac7', '#c6e3b5', '#b7dda2', '#a9d68f', '#9bcf7d', '#8cc86a', '#7ec157', '#77be4e', '#70ba45', '#65a83e', '#599537', '#4e8230', '#437029', '#385d22', '#2d4a1c', '#223815'];
    colors = ['#EBF4FA', '#C2DFFF', '#82CAFA', '#3BB9FF', '#56A5EC', '#6495ED', '#1589FF', '#157DEC', '#306EFF', '#2B65EC', '#1F45FC', '#0020C2', '#0000A0', '#151B8D', '#000080', '#151B54'];
    //colors = d3.scaleLinear().domain([1,16]).range(["white", "blue"])
    
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
        //.range([0, 9 * 20]);

    var legend = svg.append('g')
        .attr('transform', 'translate(725, 150)')
        .attr('id', 'legend');
        
        legend.selectAll()
            .data(d3.range(colors.length))
            //.data(d3.range(9))
            .enter().append('svg:rect')
                .attr('height', '20px')
                .attr('width', '20px')
                .attr('x', 5)
                .attr('y', function(d) { return d * 20; })
                //.attr("class", d => "q" + d + "-9");
                .style("fill", function(d) { return colors[d]; });
                
    var legendScale = d3.scaleLinear()
        .domain([0, d3.max(csv, function(e) { return +e.AIDES; })])
        .range([0, colors.length * 20]);
        //.range([0, 9 * 20]);
            
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
                div.html("<b>R??gion : </b>" + e.NOM_REGION + "<br>"
                        + "<b>D??partement : </b>" + e.NOM_DEPT + "<br>"
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
