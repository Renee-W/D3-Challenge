// set up chart
var svgWidth= 1000; 
var svgHeight= 600; 

var margin = { 
    top: 20,
    right: 40, 
    bottom: 90, 
    left: 100,
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins. 

var svg = d3.select("#scatter")
.append("svg")
.attr("height", svgHeight)
.attr("width", svgWidth)

// Grouping our elements together

var chartGroup= svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
var chartData = null;

var chosenXAxis = 'poverty';
var chosenYAxis = 'obesity';

var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = {"poverty":"Poverty (%)", "age":"Age (Median)", "income":"Income (Median)"}

// xScale function
function xScale(data,chosenXAxis) { 
    var xLinearScale1= d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * .8, 
    d3.max(data, d => d[chosenXAxis])*1.2])
    .range([0, width]);

    return xLinearScale1
};

// yScale function
function yScale(data,chosenXAxis) { 
    var yLinearScale1= d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis])*.8, 
    d3.max(data, d => d[chosenYAxis])*1.2])
    .range([height, 0]);

    return yLinearScale1
};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty (%):";
  }
  else if (chosenXAxis==="age"){
    label = "Age (Median):";
  }
  else {
    label = "Household Income (Median)"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`Obesity: ${d.obesity}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Reading in the csv data with d3.JS
d3.csv("assets/data/data.csv").then( function(healthData, err) {
  if (err) throw err;

    // Parse Data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity; });

    // Use the xlinear scale 
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create x and y axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //Append Axes to the chart
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // Create the Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("fill", "blue")
    .attr("opacity", ".5")
    
    var addText= chartGroup.selectAll()
    .data(healthData)
    .enter()
    .append("text")
    .text( d=> (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("text-anchor", "middle")
    .style("font-size", "11px");

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)

    var povertyLabel= labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    var ageLabel= labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(correct Median)");

    var incomeLabel= labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

    var smokeLabel= labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2.5)
    .attr("y", 0 - height)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");

    var healthcareLabel= labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2.5)
    .attr("y", 0 - (height - 20))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

    var obesityLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height+20))
    .attr("value", "obesity") // value to grab for event listener.
    .classed("inactive", true)
    .text("Obesity (%)");

    // Update tool tip function above csv import.
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Event listener for X axis
    labelsGroup.selectAll("text")
      .on("click", function() {
          // Get value of selection.
          var value = d3.select(this).attr("value");
          
          //if select x axises
          if (true) {
            if (value === "poverty" || value === "age" || value === "income") {
                // Replaces chosenXAxis with value.
                chosenXAxis = value;
                
                // Update x scale for new data.
                xLinearScale = xScale(healthData, chosenXAxis);
                
                // Updates x axis with transition.
                xAxis = renderXAxes(xLinearScale, xAxis);
                
                // Update circles with new x values.
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                
                // Update tool tips with new info.
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                
                // Update circles text with new values.
                circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                
                // Changes classes to change bold text.
                if (chosenXAxis === "poverty") {
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    
                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)

                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }}

        else {
            chosenYAxis = value;
    
            // Update y scale for new data.
            yLinearScale = yScale(healthData, chosenYAxis);

            // Updates y axis with transition.
            yAxis = renderYAxes(yLinearScale, yAxis);

            // Update circles with new x values.
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // Update tool tips with new info.
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Update circles text with new values.
            circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // Changes classes to change bold text.
            if (chosenYAxis === "healthcare") {

                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);


                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);

                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            else if (chosenYAxis === "smokes"){
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);

                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);

                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);

                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);

                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
          } 
          }
                  
          });

        });
