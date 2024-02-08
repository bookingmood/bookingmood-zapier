import type { Bundle, HttpRequestOptions, ZObject } from "zapier-platform-core";

/** Represents a full app. */
export type ZapierApp = {
  /** A version identifier for your code. */
  version: ZapierVersion;
  /** A version identifier for the Zapier execution environment. */
  platformVersion: ZapierVersion;
  /** EXPERIMENTAL: Before the perform method is called on your app, you can modify the execution context. */
  beforeApp?:
    | ZapierMiddlewares<(z: ZObject, bundle: Bundle) => unknown>
    | undefined;
  /** EXPERIMENTAL: After the perform method is called on your app, you can modify the response. */
  afterApp?:
    | ZapierMiddlewares<(z: ZObject, bundle: Bundle) => unknown>
    | undefined;
  /** Choose what scheme your API uses for authentication. */
  authentication?: ZapierAuthentication | undefined;
  /** Define a request mixin, great for setting custom headers, content-types, etc. */
  requestTemplate?: ZapierRequest | undefined;
  /** Before an HTTP request is sent via our `z.request()` client, you can modify it. */
  beforeRequest?:
    | ZapierMiddlewares<
        (request: HttpRequestOptions, z: ZObject, bundle: Bundle) => unknown
      >
    | undefined;
  /** After an HTTP response is recieved via our `z.request()` client, you can modify it. */
  afterResponse?:
    | ZapierMiddlewares<
        (request: HttpRequestOptions, z: ZObject, bundle: Bundle) => unknown
      >
    | undefined;
  /** An optional bank of named functions that you can use in `z.hydrate('someName')` to lazily load data. */
  hydrators?: ZapierHydrators | undefined;
  /** All the resources for your app. Zapier will take these and generate the relevent triggers/searches/creates automatically. */
  resources?: ZapierResources | undefined;
  /** All the triggers for your app. You can add your own here, or Zapier will automatically register any from the list/hook methods on your resources. */
  triggers?: ZapierTriggers | undefined;
  /** All of the read bulks (GETs) your app exposes to retrieve resources in batches. */
  bulkReads?: ZapierBulkReads | undefined;
  /** All the searches for your app. You can add your own here, or Zapier will automatically register any from the search method on your resources. */
  searches?: ZapierSearches | undefined;
  /** All the creates for your app. You can add your own here, or Zapier will automatically register any from the create method on your resources. */
  creates?: ZapierCreates | undefined;
  /** All the search-or-create combos for your app. You can create your own here, or Zapier will automatically register any from resources that define a search, a create, and a get (or define a searchOrCreate directly). Register non-resource search-or-creates here as well. */
  searchOrCreates?: ZapierSearchOrCreates | undefined;
  /** An alias for "searchOrCreates" */
  searchAndCreates?: ZapierSearchAndCreates | undefined;
  /** Top-level app options */
  flags?: ZapierAppFlags | undefined;
  /** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. When set here, it is the default throttle configuration used on each action of the integration. And when set in an action's operation object, it gets overwritten for that action only. */
  throttle?: ZapierThrottleObject | undefined;
  /** **INTERNAL USE ONLY**. Zapier uses this to hold properties from a legacy Web Builder app. */
  legacy?: object | undefined;
  /** **INTERNAL USE ONLY**. Zapier uses this for internal webhook app configurations. */
  firehoseWebhooks?: object | undefined;
};

/** An object describing a labeled choice in a static dropdown. Useful if the value a user picks isn't exactly what the zap uses. For instance, when they click on a nickname, but the zap uses the user's full name ([image](https://cdn.zapier.com/storage/photos/8ed01ac5df3a511ce93ed2dc43c7fbbc.png)). */
export type ZapierFieldChoiceWithLabel = {
  /** The actual value that is sent into the Zap. This is displayed as light grey text in the editor. Should match sample exactly. */
  value: string;
  /** A legacy field that is no longer used by the editor, but it is still required for now and should match the value. */
  sample: string;
  /** A human readable label for this value. */
  label: string;
};

/** Reference a resource by key and the data it returns. In the format of: `{resource_key}.{foreign_key}(.{human_label_key})`. */
export type ZapierRefResource =
  | `${string}.${string}.${string}`
  | `${string}.${string}`;

/** A static dropdown of options. Which you use depends on your order and label requirements:\n\nNeed a Label? | Does Order Matter? | Type to Use\n---|---|---\nYes | No | Object of value -> label\nNo | Yes | Array of Strings\nYes | Yes | Array of [FieldChoiceWithLabel](#Zapierfieldchoicewithlabel) */
export type ZapierFieldChoices =
  | Record<string, unknown>
  | Array<string | ZapierFieldChoiceWithLabel>;

/** Defines a field an app either needs as input, or gives as output. In addition to the requirements below, the following keys are mutually exclusive:\n\n* `children` & `list`\n* `children` & `dict`\n* `children` & `type`\n* `children` & `placeholder`\n* `children` & `helpText`\n* `children` & `default`\n* `dict` & `list`\n* `dynamic` & `dict`\n* `dynamic` & `choices` */
export type ZapierField = {
  /** A unique machine readable key for this value (IE: "fname"). */
  key: string;
  /** A human readable label for this value (IE: "First Name"). */
  label?: string | undefined;
  /** A human readable description of this value (IE: "The first part of a full name."). You can use Markdown. */
  helpText?: string | undefined;
  /** The type of this value. Use `string` for basic text input, `text` for a large, `<textarea>` style box, and `code` for a `<textarea>` with a fixed-width font. Field type of `file` will accept either a file object or a string. If a URL is provided in the string, Zapier will automatically make a GET for that file. Otherwise, a .txt file will be generated. */
  type?:
    | "string"
    | "text"
    | "integer"
    | "number"
    | "boolean"
    | "datetime"
    | "file"
    | "password"
    | "copy"
    | "code"
    | undefined;
  /** If this value is required or not. */
  required?: boolean | undefined;
  /** An example value that is not saved. */
  placeholder?: string | undefined;
  /** A default value that is saved the first time a Zap is created. */
  default?: string | undefined;
  /** A reference to a trigger that will power a dynamic dropdown. */
  dynamic?: ZapierRefResource | undefined;
  /** A reference to a search that will guide the user to add a search step to populate this field when creating a Zap. */
  search?: ZapierRefResource | undefined;
  /** An object of machine keys and human values to populate a static dropdown. */
  choices?: ZapierFieldChoices | undefined;
  /** Acts differently when used in inputFields vs. when used in outputFields. In inputFields: Can a user provide multiples of this field? In outputFields: Does this field return an array of items of type `type`? */
  list?: boolean | undefined;
  children?: Array<ZapierField> | undefined;
  /** Is this field a key/value input? */
  dict?: boolean | undefined;
  /** Is this field automatically populated (and hidden from the user)? Note: Only OAuth and Session Auth support fields with this key. */
  computed?: boolean | undefined;
  /** Does the value of this field affect the definitions of other fields in the set? */
  altersDynamicFields?: boolean | undefined;
  /** Prevents triggering on new output until all values for fields with this property remain unchanged for 2 polls. It can be used to, e.g., not trigger on a new contact until the contact has completed typing their name. NOTE that this only applies to the `outputFields` of polling triggers. */
  steadyState?: boolean | undefined;
  /** Useful when you expect the input to be part of a longer string. Put "{{input}}" in place of the user\'s input (IE: "https://{{input}}.yourdomain.com"). */
  inputFormat?: `${string}{{input}}${string}` | undefined;
};

/** A path to a file that might have content like `module.exports = (z, bundle) => [{id: 123}];`. */
export type ZapierFunctionRequire = {
  require: string;
};

/** Source code like `{source: "return 1 + 2"}` which the system will wrap in a function for you. */
export type ZapierFunctionSource = {
  /** JavaScript code for the function body. This must end with a `return` statement. */
  source: string;
  /** Function signature. Defaults to `['z', 'bundle']` if not specified. */
  args?: Array<string> | undefined;
};

/** An object whose values can only be primitives */
export type ZapierFlatObject = Record<string, null | string | number | boolean>;

/** Internal pointer to a function from the original source or the source code itself. Encodes arity and if `arguments` is used in the body. Note - just write normal functions and the system will encode the pointers for you. Or, provide {source: "return 1 + 2"} and the system will wrap in a function for you. */
export type ZapierFunction<T extends Function> =
  | string
  | T
  | ZapierFunctionRequire
  | ZapierFunctionSource;

/** A representation of a HTTP request - you can use the `{{syntax}}` to inject authentication, field or global variables. */
export type ZapierRequest = {
  /** de "The HTTP method for the request. */
  method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "HEAD" | undefined;
  /** A URL for the request (we will parse the querystring and merge with params). Keys and values will not be re-encoded. */
  url?: string | undefined;
  /** Can be nothing, a raw string or JSON (object or array). */
  body?: null | string | Array<unknown> | object | undefined;
  /** A mapping of the querystring - will get merged with any query params in the URL. Keys and values will be encoded. */
  params?: ZapierFlatObject | undefined;
  /** The HTTP headers for the request. */
  headers?: ZapierFlatObject | undefined;
  /** An object holding the auth parameters for OAuth1 request signing, like `{oauth_token: 'abcd', oauth_token_secret: '1234'}`. Or an array reserved (i.e. not implemented yet) to hold the username and password for Basic Auth. Like `['AzureDiamond', 'hunter2']`. */
  auth?: [string, string] | ZapierFlatObject | undefined;
  /** Should missing values be sent? (empty strings, `null`, and `undefined` only — `[]`, `{}`, and `false` will still be sent). Allowed fields are `params` and `body`. The default is `false`, ex: ```removeMissingValuesFrom: { params: false, body: false }``` */
  removeMissingValuesFrom?:
    | {
        /** Refers to data sent via a requests query params (`req.params`) */
        params?: boolean | undefined;
        /** Refers to tokens sent via a requsts body (`req.body`) */
        body?: boolean | undefined;
      }
    | undefined;
  /** A function to customize how to serialize a value for curlies `{{var}}` in the request object. By default, when this is unspecified, the request client only replaces curlies where variables are strings, and would throw an error for non-strings. The function should accepts a single argument as the value to be serialized and return the string representation of the argument. */
  serializeValueForCurlies?: ZapierFunction<() => unknown> | undefined;
  /** If `true`, don't throw an exception for response 400 <= status < 600 automatically before resolving with the response. Defaults to `false`. */
  skipThrowForStatus?: boolean | undefined;
  /** Contains the characters that you want left unencoded in the query params (`req.params`). If unspecified, `z.request()` will percent-encode non-ascii characters and these reserved characters: ``:$/?#[]@$&+,;=^@`\\``. */
  skipEncodingChars?: string | undefined;
};

/** A representation of a HTTP redirect - you can use the `{{syntax}}` to inject authentication, field or global variables. */
export type ZapierRedirectRequest = {
  /** The HTTP method for the request. */
  method?: "GET" | undefined;
  /** A URL for the request (we will parse the querystring and merge with params). Keys and values will not be re-encoded. */
  url?: string | undefined;
  /** A mapping of the querystring - will get merged with any query params in the URL. Keys and values will be encoded. */
  params?: ZapierFlatObject | undefined;
};

/** An array or collection of fields. */
export type ZapierFields = Array<ZapierField>;

/** Config for Basic Authentication. No extra properties are required to setup Basic Auth, so you can leave this empty if your app uses Basic Auth. */
export type ZapierAuthenticationBasicConfig = { [x: string]: never };

/** Config for custom authentication (like API keys). No extra properties are required to setup this auth type, so you can leave this empty if your app uses a custom auth method. */
export type ZapierAuthenticationCustomConfig = {
  /** EXPERIMENTAL: Define the call Zapier should make to send the OTP code. */
  sendCode?: ZapierRequest | ZapierFunction<() => unknown> | undefined;
};

/** Config for Digest Authentication. No extra properties are required to setup Digest Auth, so you can leave this empty if your app uses Digets Auth. */
export type ZapierAuthenticationDigestConfig = { [x: string]: never };

/** Config for OAuth1 authentication. */
export type ZapierAuthenticationOAuth1Config = {
  /** Define where Zapier will acquire a request token which is used for the rest of the three legged authentication process. */
  getRequestToken: ZapierRequest | ZapierFunction<() => unknown>;
  /** Define where Zapier will redirect the user to authorize our app. Typically, you should append an `oauth_token` querystring parameter to the request. */
  authorizeUrl: ZapierRedirectRequest | ZapierFunction<() => unknown>;
  /** Define how Zapier fetches an access token from the API */
  getAccessToken: ZapierRequest | ZapierFunction<() => unknown>;
};

/** Config for OAuth2 authentication. */
export type ZapierAuthenticationOAuth2Config = {
  /** Define where Zapier will redirect the user to authorize our app. Note: we append the redirect URL and state parameters to return value of this function. */
  authorizeUrl: ZapierRedirectRequest | ZapierFunction<() => unknown>;
  /** Define how Zapier fetches an access token from the API */
  getAccessToken: ZapierRequest | ZapierFunction<() => unknown>;
  /** Define how Zapier will refresh the access token from the API */
  refreshAccessToken?:
    | ZapierRequest
    | ZapierFunction<() => unknown>
    | undefined;
  /** Define a non-standard code param Zapier should scrape instead. */
  codeParam?: string | undefined;
  /** What scope should Zapier request? */
  scope?: string | undefined;
  /** Should Zapier invoke `refreshAccessToken` when we receive an error for a 401 response? */
  autoRefresh?: boolean | undefined;
  /** Should Zapier use PKCE for OAuth2? */
  enablePkce?: boolean | undefined;
};

/** Config for session authentication. */
export type ZapierAuthenticationSessionConfig = {
  /** Define how Zapier fetches the additional authData needed to make API calls. */
  perform: ZapierRequest | ZapierFunction<() => unknown>;
};

/** Represents an array of fields or functions. */
export type ZapierFieldOrFunction = Array<
  ZapierField | ZapierFunction<(z: ZObject, bundle: Bundle) => ZapierField>
>;

/** Like [/ZapierFields](#Zapierfields) but you can provide functions to create dynamic or custom fields. */
export type ZapierDynamicFields = ZapierFieldOrFunction;

/** A unique identifier for this item. */
export type ZapierKey = string;

/** **INTERNAL USE ONLY**. Zapier uses this configuration for internal operation locking. */
export type ZapierLockObject = {
  /** The key to use for locking. This should be unique to the operation. While actions of different integrations with the same key and scope will never lock each other out, actions of the same integration with the same key and scope will do. User data provided for the input fields can be used in the key with the use of the curly braces referencing. For example, to access the user data provided for the input field "test_field", use `{{bundle.inputData.test_field}}`. Note that a required input field should be referenced to get user data always. */
  key: string;
  /** By default, locks are scoped to the app. That is, all users of the app will share the same locks. If you want to restrict serial access to a specific user, auth, or account, you can set the scope to one or more of the following: 'user' - Locks based on user ids.  'auth' - Locks based on unique auth ids. 'account' - Locks for all users under a single account. You may also combine scopes. Note that \"app\" is included, always, in the scope provided. For example, a scope of ['account', 'auth'] would result to ['app', 'account', 'auth']. */
  scope?: Array<"user" | "auth" | "account"> | undefined;
  /** The number of seconds to hold the lock before releasing it to become accessible to other task invokes that need it. If not provided, the default set by the app will be used. It cannot be more than 180. */
  timeout?: number | undefined;
};

/** An array of objects suitable for returning in perform calls. */
export type ZapierResults = Array<Record<string, unknown>>;

/** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. */
export type ZapierThrottleObject = {
  /** The timeframe, in seconds, within which the system tracks the number of invocations for an action. The number of invocations begins at zero at the start of each window. */
  window: number;
  /** The maximum number of invocations for an action, allowed within the timeframe window. */
  limit: number;
  /** The granularity to throttle by. You can set the scope to one or more of the following: 'user' - Throttles based on user ids.  'auth' - Throttles based on auth ids. 'account' - Throttles based on account ids for all users under a single account. By default, throttling is scoped to the account. */
  scope?: Array<"user" | "auth" | "account"> | undefined;
};

/** Represents user information for a trigger, search, or create. */
export type ZapierBasicDisplay = {
  /** de 'A short label like "New Record" or "Create Record in Project". Optional if `hidden` is true. */
  label?: string | undefined;
  /** A description of what this trigger, search, or create does. Optional if `hidden` is true. */
  description?: string | undefined;
  /** A short blurb that can explain how to get this working. EG: how and where to copy-paste a static hook URL into your application. Only evaluated for static webhooks. */
  directions?: string | undefined;
  /** Should this operation be unselectable by users? */
  hidden?: boolean | undefined;
};

/** Represents the fundamental mechanics of triggers, searches, or creates. */
export type ZapierBasicOperation = {
  /** Optionally reference and extends a resource. Allows Zapier to automatically tie together samples, lists and hooks, greatly improving the UX. EG: if you had another trigger reusing a resource but filtering the results. */
  resource?: ZapierKey | undefined;
  /** How will Zapier get the data? This can be a function like `(z) => [{id: 123}]` or a request like `{url: 'http...'}`. */
  perform:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** What should the form a user sees and configures look like? */
  inputFields?: ZapierDynamicFields | undefined;
  /** What fields of data will this return? Will use resource outputFields if missing, will also use sample if available. */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? Will use resource sample if missing. Requirement waived if `display.hidden` is true or if this belongs to a resource that has a top-level sample */
  sample?: Record<string, unknown> | undefined;
  /** **INTERNAL USE ONLY**. Zapier uses this configuration for internal operation locking. */
  lock?: ZapierLockObject | undefined;
  /** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. */
  throttle?: ZapierThrottleObject | undefined;
};

/** Represents the inbound mechanics of hooks with optional subscribe/unsubscribe. Defers to list for fields. */
export type ZapierBasicHookOperation = {
  /** Must be explicitly set to `"hook"` unless this hook is defined as part of a resource, in which case it\'s optional. */
  type?: "hook" | undefined;
  /** Optionally reference and extends a resource. Allows Zapier to automatically tie together samples, lists and hooks, greatly improving the UX. EG: if you had another trigger reusing a resource but filtering the results. */
  resource?: ZapierKey | undefined;
  /** A function that processes the inbound webhook request. */
  perform: ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** Fetch a list of items on demand during testing instead of waiting for a hook. You can also consider resources and their built-in hook/list methods. Note: this is required for public apps to ensure the best UX for the end-user. For private apps, this is strongly recommended for testing REST Hooks. Otherwise, you can ignore warnings about this property with the `--without-style` flag during `zapier push`. */
  performList?:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>
    | undefined;
  /** Does this endpoint support pagination via temporary cursor storage? */
  canPaginate?: boolean | undefined;
  /** Takes a URL and any necessary data from the user and subscribes. Note: this is required for public apps to ensure the best UX for the end-user. For private apps, this is strongly recommended for testing REST Hooks. Otherwise, you can ignore warnings about this property with the `--without-style` flag during `zapier push`. */
  performSubscribe?:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>
    | undefined;
  /** Takes a URL and data from a previous subscribe call and unsubscribes. Note: this is required for public apps to ensure the best UX for the end-user. For private apps, this is strongly recommended for testing REST Hooks. Otherwise, you can ignore warnings about this property with the `--without-style` flag during `zapier push`. */
  performUnsubscribe?:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>
    | undefined;
  /** What should the form a user sees and configures look like? */
  inputFields?: ZapierDynamicFields | undefined;
  /** What fields of data will this return? Will use resource outputFields if missing, will also use sample if available. */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? Will use resource sample if missing. Requirement waived if `display.hidden` is true or if this belongs to a resource that has a top-level sample */
  sample?: Record<string, unknown> | undefined;
  /** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. */
  throttle?: ZapierThrottleObject | undefined;
};

/** Represents the fundamental mechanics of a trigger. */
export type ZapierBasicPollingOperation = {
  /** Clarify how this operation works (polling == pull or hook == push). */
  type?: "polling" | undefined;
  /** Optionally reference and extends a resource. Allows Zapier to automatically tie together samples, lists and hooks, greatly improving the UX. EG: if you had another trigger reusing a resource but filtering the results. */
  resource?: ZapierKey | undefined;
  /** How will Zapier get the data? This can be a function like `(z) => [{id: 123}]` or a request like `{url: 'http...'}`. */
  perform:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** Does this endpoint support pagination via temporary cursor storage? */
  canPaginate?: boolean | undefined;
  /** What should the form a user sees and configures look like? */
  inputFields?: ZapierDynamicFields | undefined;
  /** What fields of data will this return? Will use resource outputFields if missing, will also use sample if available. */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? Will use resource sample if missing. Requirement waived if `display.hidden` is true or if this belongs to a resource that has a top-level sample */
  sample?: Record<string, unknown> | undefined;
  /** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. */
  throttle?: ZapierThrottleObject | undefined;
};

/** Represents the fundamental mechanics of a search/create. */
export type ZapierBasicActionOperation = {
  /** Optionally reference and extends a resource. Allows Zapier to automatically tie together samples, lists and hooks, greatly improving the UX. EG: if you had another trigger reusing a resource but filtering the results. */
  resource?: ZapierKey | undefined;
  /** How will Zapier get the data? This can be a function like `(z) => [{id: 123}]` or a request like `{url: 'http...'}`. */
  perform:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** A function that parses data from a perform (which uses z.generateCallbackUrl()) and callback request to resume this action. */
  performResume?: ZapierFunction<() => unknown> | undefined;
  /** How will Zapier get a single record? If you find yourself reaching for this - consider resources and their built-in get methods. */
  performGet?: ZapierRequest | ZapierFunction<() => unknown> | undefined;
  /** What should the form a user sees and configures look like? */
  inputFields?: ZapierDynamicFields | undefined;
  /** What fields of data will this return? Will use resource outputFields if missing, will also use sample if available. */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? Will use resource sample if missing. Requirement waived if `display.hidden` is true or if this belongs to a resource that has a top-level sample */
  sample?: Record<string, unknown> | undefined;
  /** **INTERNAL USE ONLY**. Zapier uses this configuration for internal operation locking. */
  lock?: ZapierLockObject | undefined;
  /** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. */
  throttle?: ZapierThrottleObject | undefined;
};

/** How will we get a single object given a unique identifier/id? */
export type ZapierResourceMethodGet = {
  /** Define how this get method will be exposed in the UI. */
  display: ZapierBasicDisplay;
  /** Define how this get method will work. */
  operation: ZapierBasicOperation;
};

/** How will we get notified of new objects? Will be turned into a trigger automatically. */
export type ZapierResourceMethodHook = {
  /** Define how this hook/trigger method will be exposed in the UI. */
  display: ZapierBasicDisplay;
  /** Define how this hook/trigger method will work. */
  operation: ZapierBasicHookOperation;
};

/** How will we get a list of new objects? Will be turned into a trigger automatically. */
export type ZapierResourceMethodList = {
  /** Define how this list/trigger method will be exposed in the UI. */
  display: ZapierBasicDisplay;
  /** Define how this list/trigger method will work. */
  operation: ZapierBasicPollingOperation;
};

/** How will we find a specific object given filters or search terms? Will be turned into a search automatically. */
export type ZapierResourceMethodSearch = {
  /** Define how this search method will be exposed in the UI. */
  display: ZapierBasicDisplay;
  /** Define how this search method will work. */
  operation: ZapierBasicActionOperation;
};

/** How will we find create a specific object given inputs? Will be turned into a create automatically. */
export type ZapierResourceMethodCreate = {
  /** Define how this create method will be exposed in the UI. */
  display: ZapierBasicDisplay;
  /** Define how this create method will work. */
  operation: ZapierBasicActionOperation;
};

/** Represents a resource, which will in turn power triggers, searches, or creates. */
export type ZapierResource = {
  /** de "A key to uniquely identify this resource. */
  key: ZapierKey;
  /** A noun for this resource that completes the sentence "create a new XXX". */
  noun: string;
  /** How will we get a single object given a unique identifier/id? */
  get?: ZapierResourceMethodGet | undefined;
  /** How will we get notified of new objects? Will be turned into a trigger automatically. */
  hook?: ZapierResourceMethodHook | undefined;
  /** How will we get a list of new objects? Will be turned into a trigger automatically. */
  list?: ZapierResourceMethodList | undefined;
  /** How will we find a specific object given filters or search terms? Will be turned into a search automatically. */
  search?: ZapierResourceMethodSearch | undefined;
  /** How will we find create a specific object given inputs? Will be turned into a create automatically. */
  create?: ZapierResourceMethodCreate | undefined;
  /** What fields of data will this return? */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? */
  sample?: Record<string, unknown> | undefined;
};

/** How will Zapier fetch resources from your application? */
export type ZapierBulkRead = {
  /** A key to uniquely identify a record. */
  key: ZapierKey;
  /** A noun for this read that completes the sentence "reads all of the XXX". */
  noun: string;
  /** Configures the UI for this read bulk. */
  display: ZapierBasicDisplay;
  /** Powers the functionality for this read bulk. */
  operation: ZapierBasicActionOperation;
};

/** Represents the inbound mechanics of hook to poll style triggers. Defers to list for fields. */
export type ZapierBasicHookToPollOperation = {
  /** Must be explicitly set to `"hook_to_poll"`. */
  type?: "hook_to_poll" | undefined;
  /** Similar a polling trigger, but checks for new data when a webhook is received, instead of every few minutes */
  performList:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** Does this endpoint support pagination via temporary cursor storage? */
  canPaginate?: boolean | undefined;
  /** Takes a URL and any necessary data from the user and subscribes. */
  performSubscribe:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** Takes a URL and data from a previous subscribe call and unsubscribes. */
  performUnsubscribe:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** What should the form a user sees and configures look like? */
  inputFields?: ZapierDynamicFields | undefined;
  /** What fields of data will this return? Will use resource outputFields if missing, will also use sample if available. */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? Will use resource sample if missing. Requirement waived if `display.hidden` is true or if this belongs to a resource that has a top-level sample */
  sample?: Record<string, unknown> | undefined;
};

/** How will Zapier get notified of new objects? */
export type ZapierTrigger = {
  /** A key to uniquely identify this trigger. */
  key: ZapierKey;
  /** A noun for this trigger that completes the sentence "triggers on a new XXX". */
  noun: string;
  /** Configures the UI for this trigger. */
  display: ZapierBasicDisplay;
  /** Powers the functionality for this trigger. */
  operation:
    | ZapierBasicPollingOperation
    | ZapierBasicHookOperation
    | ZapierBasicHookToPollOperation;
};

/** How will Zapier search for existing objects? */
export type ZapierSearch = {
  /** A key to uniquely identify this search. */
  key: ZapierKey;
  /** A noun for this search that completes the sentence "finds a specific XXX". */
  noun: string;
  /** Configures the UI for this search. */
  display: ZapierBasicDisplay;
  /** Powers the functionality for this search. */
  operation: ZapierBasicActionOperation;
};

/** Represents the fundamental mechanics of a create. */
export type ZapierBasicCreateActionOperation = {
  /** Optionally reference and extends a resource. Allows Zapier to automatically tie together samples, lists and hooks, greatly improving the UX. EG: if you had another trigger reusing a resource but filtering the results. */
  resource?: ZapierKey | undefined;
  /** How will Zapier get the data? This can be a function like `(z) => [{id: 123}]` or a request like `{url: 'http...'}`. */
  perform:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** A function that parses data from a perform (which uses z.generateCallbackUrl()) and callback request to resume this action. */
  performResume?: ZapierFunction<() => unknown> | undefined;
  /** How will Zapier get a single record? If you find yourself reaching for this - consider resources and their built-in get methods. */
  performGet?: ZapierRequest | ZapierFunction<() => unknown> | undefined;
  /** What should the form a user sees and configures look like? */
  inputFields?: ZapierDynamicFields | undefined;
  /** What fields of data will this return? Will use resource outputFields if missing, will also use sample if available. */
  outputFields?: ZapierDynamicFields | undefined;
  /** What does a sample of data look like? Will use resource sample if missing. Requirement waived if `display.hidden` is true or if this belongs to a resource that has a top-level sample */
  sample?: Record<string, unknown> | undefined;
  /** **INTERNAL USE ONLY**. Zapier uses this configuration for internal operation locking. */
  lock?: ZapierLockObject | undefined;
  /** Zapier uses this configuration to apply throttling when the limit for the window is exceeded. */
  throttle?: ZapierThrottleObject | undefined;
  /** Should this action be performed one at a time (avoid concurrency)? */
  shouldLock?: boolean | undefined;
};

/** How will Zapier create a new object? */
export type ZapierCreate = {
  /** A key to uniquely identify this create. */
  key: ZapierKey;
  /** A noun for this create that completes the sentence "creates a new XXX". */
  noun: string;
  /** Configures the UI for this create. */
  display: ZapierBasicDisplay;
  /** Powers the functionality for this create. */
  operation: ZapierBasicCreateActionOperation;
};

/** Pair an existing search and a create to enable "Find or Create" functionality in your app */
export type ZapierSearchOrCreate = {
  /** A key to uniquely identify this search-or-create. Must match the search key. */
  key: ZapierKey;
  /** Configures the UI for this search-or-create. */
  display: ZapierBasicDisplay;
  /** The key of the search that powers this search-or-create */
  search: ZapierKey;
  /** The key of the create that powers this search-or-create */
  create: ZapierKey;
  /** EXPERIMENTAL: The key of the update action (in `creates`) that will be used if a search succeeds. */
  update?: ZapierKey | undefined;
  /** EXPERIMENTAL: A mapping where the key represents the input field for the update action, and the value represents the field from the search action's output that should be mapped to the update action's input field. */
  updateInputFromSearchOutput?: ZapierFlatObject | undefined;
  /** EXPERIMENTAL: A mapping where the key represents an input field for the search action, and the value represents how that field's value will be used to filter down the search output for an exact match. */
  searchUniqueInputToOutputConstraint?: object | undefined;
};

/** Enumerates the search-or-creates your app has available for users. */
export type ZapierSearchOrCreates = Record<string, ZapierSearchOrCreate>;

/** Represents authentication schemes. */
export type ZapierAuthentication = {
  /** Choose which scheme you want to use. */
  type: "basic" | "custom" | "digest" | "oauth1" | "oauth2" | "session";
  /** A function or request that confirms the authentication is working. */
  test: ZapierRequest | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>;
  /** Fields you can request from the user before they connect your app to Zapier. */
  fields?: ZapierFields | undefined;
  /** A string with variables, function, or request that returns the connection label for the authenticated user. */
  connectionLabel?:
    | ZapierRequest
    | ZapierFunction<(z: ZObject, bundle: Bundle) => unknown>
    | string
    | undefined;
  basicConfig?: ZapierAuthenticationBasicConfig | undefined;
  customConfig?: ZapierAuthenticationCustomConfig | undefined;
  digestConfig?: ZapierAuthenticationDigestConfig | undefined;
  oauth1Config?: ZapierAuthenticationOAuth1Config | undefined;
  oauth2Config?: ZapierAuthenticationOAuth2Config | undefined;
  sessionConfig?: ZapierAuthenticationSessionConfig | undefined;
};

/** All the resources that underlie common CRUD methods powering automatically handled triggers, creates, and searches for your app. Zapier will break these apart for you. */
export type ZapierResources = Record<string, ZapierResource>;

/** Enumerates the bulk reads your app exposes. */
export type ZapierBulkReads = Record<string, ZapierBulkRead>;

/** Enumerates the triggers your app has available for users. */
export type ZapierTriggers = Record<string, ZapierTrigger>;

/** Enumerates the searches your app has available for users. */
export type ZapierSearches = Record<string, ZapierSearch>;

/** Enumerates the creates your app has available for users. */
export type ZapierCreates = Record<string, ZapierCreate>;

/** Alias for /ZapierSearchOrCreates */
export type ZapierSearchAndCreates = Record<string, ZapierSearchOrCreate>;

/** Represents a simplified semver string, from `0.0.0` to `999.999.999`. */
export type ZapierVersion = `${number}.${number}.${number}`;

/** List of before or after middlewares. Can be an array of functions or a single function */
export type ZapierMiddlewares<T extends Function> =
  | ZapierFunction<T>
  | Array<ZapierFunction<T>>;

/** A bank of named functions that you can use in `z.hydrate('someName')` to lazily load data. */
export type ZapierHydrators = Record<string, ZapierFunction<() => unknown>>;

/** Codifies high-level options for your integration. */
export type ZapierAppFlags = {
  /** By default, Zapier patches the core `http` module so that all requests (including those from 3rd-party SDKs) can be logged. Set this to true if you're seeing issues using an SDK (such as AWS). */
  skipHttpPatch: boolean;
  /** Starting in `core` version `10.0.0`, `response.throwForStatus()` was called by default. We introduced a per-request way to opt-out of this behavior. This flag takes that a step further and controls that behavior integration-wide **for requests made using `z.request()`**. Unless they specify otherwise (per-request, or via middleware), [Shorthand requests](https://github.com/zapier/zapier-platform/blob/main/packages/cli/README.md#shorthand-http-requests) _always_ call `throwForStatus()`. `z.request()` calls can also ignore this flag if they set `skipThrowForStatus` directly */
  skipThrowForStatus: boolean;
};
