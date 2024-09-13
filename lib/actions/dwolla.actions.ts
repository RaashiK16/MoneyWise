"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  if (!environment) {
    throw new Error("DWOLLA_ENV is not set");
  }

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

// Check if Dwolla credentials are set
const checkDwollaCredentials = () => {
  if (!process.env.DWOLLA_KEY || !process.env.DWOLLA_SECRET) {
    throw new Error("Dwolla API Key and Secret must be set.");
  }
};

checkDwollaCredentials();

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Function to validate CreateFundingSourceOptions
const validateFundingSourceOptions = (options: CreateFundingSourceOptions) => {
  if (!options.customerId) {
    throw new Error("customerId is required");
  }
  if (!options.fundingSourceName) {
    throw new Error("fundingSourceName is required");
  }
  if (!options.plaidToken) {
    throw new Error("plaidToken is required");
  }
};

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  validateFundingSourceOptions(options);

  try {
    const res = await dwollaClient.post(
      `customers/${options.customerId}/funding-sources`,
      {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      }
    );
    return res.headers.get("location");
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
    throw err; // Re-throw the error for higher-level handling
  }
};

// Function to validate and handle on-demand authorization creation
export const createOnDemandAuthorization = async () => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    return onDemandAuthorization.body._links;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
    throw err;
  }
};

// Create a Dwolla Customer
export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    const res = await dwollaClient.post("customers", newCustomer);
    return res.headers.get("location");
  } catch (err) {
    console.error("Creating a Dwolla Customer Failed: ", err);
    throw err;
  }
};

// Validate and handle the transfer creation
const validateTransferParams = (params: TransferParams) => {
  const { sourceFundingSourceUrl, destinationFundingSourceUrl, amount } =
    params;
  if (!sourceFundingSourceUrl || !destinationFundingSourceUrl) {
    throw new Error("Both source and destination funding source URLs are required");
  }
  if (!amount || parseFloat(amount) <= 0) {
    throw new Error("Valid transfer amount is required");
  }
};

// Create a transfer between funding sources
export const createTransfer = async (params: TransferParams) => {
  validateTransferParams(params);

  try {
    const requestBody = {
      _links: {
        source: {
          href: params.sourceFundingSourceUrl,
        },
        destination: {
          href: params.destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: params.amount,
      },
    };
    const res = await dwollaClient.post("transfers", requestBody);
    return res.headers.get("location");
  } catch (err) {
    console.error("Transfer fund failed: ", err);
    throw err;
  }
};

// Add a funding source to a Dwolla customer
export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // Create Dwolla authorization link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // Add funding source to Dwolla customer & get the funding source URL
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };

    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Adding Funding Source Failed: ", err);
    throw err;
  }
};
