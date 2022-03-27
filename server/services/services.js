/**
 * @description Evaluates the validity of the query parameters, calls arabicToRoman function and sends a response back to the client.
 */
exports.toRoman = (req, res) => {
  const promises = [];

  if (numberIsValid(req.query))
    arabicToRoman(req.query.query)
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        //console.log("There was an error processing the result.\n", error);
        res.status(404).json({ message: "Couldn't process the request." });
      });
  else if (rangeIsValid(req.query)) {
    for (let i = parseInt(req.query.min, 10); i <= parseInt(req.query.max, 10); i++)
      promises.push(arabicToRoman(i.toString()));

    //Promise.all() waits for all promises to be resolved/rejected and provides an array results with all the values returned by promises
    Promise.all(promises)
      .then((results) => {
        res.json({ conversions: results });
      })
      .catch((error) => {
        //console.log("There was an error processing the results.\n", error);
        res.status(404).json({ message: "Couldn't process the request." });
      });
  } else res.status(404).json({ message: "Invalid route." });
};

/**
 * @description Asynchronous function that converts an arabic to a roman numeral.
 * @param {String} numberAsString Arabic number to convert.
 * @return {Promise} Promise is converted into an object as soon as it is resolved.
 */
async function arabicToRoman(numberAsString) {
  return new Promise((resolve) => {
    const symbols = [
      { value: "I", half: "V" },
      { value: "X", half: "L" },
      { value: "C", half: "D" },
      { value: "M" }
    ];
    let numeral = "";

    //iterates over numberAsString in ascending order (i index) and over symbols in descending order (j index)
    for (let i = 0; i < numberAsString.length; i++) {
      digit = parseInt(numberAsString.charAt(i), 10);
      let j = numberAsString.length - i - 1;

      if (1 <= digit && digit < 4)
        for (let k = 0; k < digit; k++) 
          numeral += symbols[j].value;
      else if (digit == 4) 
        numeral += symbols[j].value + symbols[j].half;
      else if (5 <= digit && digit < 9) {
        numeral += symbols[j].half;
        for (let k = 0; k < digit - 5; k++) 
          numeral += symbols[j].value;
      } else if (digit == 9) 
        numeral += symbols[j].value + symbols[j + 1].value;
    }

    resolve({ input: numberAsString, output: numeral });
  });
}

/**
 * @description Checks the validity of the arabic number in the request query.
 * @param {object} query Request query parameters.
 * @return {boolean} true if the parameter is valid, or false if not.
 */
function numberIsValid(query) {
  return (
    query.query &&
    Object.keys(query).length == 1 &&
    /^\d+$/.test(query.query) && //This condition is stronger than !isNaN(query.query), because the former also excludes numbers with '-' and '.' signs, for example.
    1 <= parseInt(query.query, 10) &&
    parseInt(query.query, 10) <= 3999
  );
}

/**
 * @description Checks the validity of the range given in the request query.
 * @param {object} query Request query parameters.
 * @return {boolean} true if the parameters are valid, or false if not.
 */
function rangeIsValid(query) {
  return (
    query.min &&
    query.max &&
    Object.keys(query).length == 2 &&
    /^\d+$/.test(query.min) &&
    /^\d+$/.test(query.max) &&
    1 <= parseInt(query.min, 10) &&
    parseInt(query.min, 10) < parseInt(query.max, 10) &&
    parseInt(query.max, 10) <= 3999
  );
}
