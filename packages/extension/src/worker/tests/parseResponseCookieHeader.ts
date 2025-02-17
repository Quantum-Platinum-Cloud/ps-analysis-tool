/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Internal dependencies.
 */
import parseResponseCookieHeader from '../parseResponseCookieHeader';

describe('parseResponseCookieHeader', () => {
  it('Should parse all set-cookie header (response cookies)', () => {
    const parsedCookie = parseResponseCookieHeader(
      'https://example.com/public/api/alerts',
      'countryCode=IN; Domain=.example.com; Path=/; SameSite=None; Secure',
      {}
    );

    expect(parsedCookie).toEqual({
      parsedCookie: {
        expires: 0,
        httponly: false,
        secure: true,
        path: '/',
        domain: '.example.com',
        samesite: 'None',
        name: 'countryCode',
        value: 'IN',
      },
      analytics: null,
      url: 'https://example.com/public/api/alerts',
      headerType: 'response',
    });
  });

  it('Should parse and add add analytics', () => {
    const parsedCookie = parseResponseCookieHeader(
      'https://example.com/public/api/alerts',
      'test_cookie=bla; Domain=.example.com; Path=/; SameSite=None; Secure',
      {
        test_cookie: [
          {
            platform: 'DoubleClick/Google Marketing',
            category: 'Functional',
            name: 'test_cookie',
            domain: 'doubleclick.net',
            description:
              "This cookie is set by DoubleClick (which is owned by Google) to determine if the website visitor's browser supports cookies.",
            retention: '1 year',
            dataController: 'Google',
            gdprUrl: 'https://privacy.google.com/take-control.html',
            wildcard: '0',
          },
        ],
      }
    );

    expect(parsedCookie).toEqual({
      parsedCookie: {
        expires: 0,
        httponly: false,
        secure: true,
        path: '/',
        domain: '.example.com',
        samesite: 'None',
        name: 'test_cookie',
        value: 'bla',
      },
      analytics: {
        platform: 'DoubleClick/Google Marketing',
        category: 'Functional',
        name: 'test_cookie',
        domain: 'doubleclick.net',
        description:
          "This cookie is set by DoubleClick (which is owned by Google) to determine if the website visitor's browser supports cookies.",
        retention: '1 year',
        dataController: 'Google',
        gdprUrl: 'https://privacy.google.com/take-control.html',
        wildcard: '0',
      },
      url: 'https://example.com/public/api/alerts',
      headerType: 'response',
    });
  });

  it('Should parse and add add analytics for wild card entries', () => {
    const parsedCookie = parseResponseCookieHeader(
      'https://google.com/public/api/alerts',
      '_ga_123=bla; Domain=.google.com; Path=/; SameSite=None; Secure',
      {
        _ga: [
          {
            platform: 'Should not match',
            category: 'Analytics',
            name: '_ga',
            domain:
              "google-analytics.com (3rd party) or advertiser's website domain (1st party)",
            description: 'ID used to identify users',
            retention: '2 years',
            dataController: 'Google',
            gdprUrl: 'https://privacy.google.com/take-control.html',
            wildcard: '0',
          },
        ],
        '_ga_*': [
          {
            platform: 'Google Analytics',
            category: 'Analytics',
            name: '_ga_',
            domain:
              "google-analytics.com (3rd party) or advertiser's website domain (1st party)",
            description: 'ID used to identify users',
            retention: '2 years',
            dataController: 'Google',
            gdprUrl: 'https://privacy.google.com/take-control.html',
            wildcard: '1',
          },
        ],
      }
    );

    expect(parsedCookie).toEqual({
      parsedCookie: {
        expires: 0,
        httponly: false,
        secure: true,
        path: '/',
        domain: '.google.com',
        samesite: 'None',
        name: '_ga_123',
        value: 'bla',
      },
      analytics: {
        platform: 'Google Analytics',
        category: 'Analytics',
        name: '_ga_',
        domain:
          "google-analytics.com (3rd party) or advertiser's website domain (1st party)",
        description: 'ID used to identify users',
        retention: '2 years',
        dataController: 'Google',
        gdprUrl: 'https://privacy.google.com/take-control.html',
        wildcard: '1',
      },
      url: 'https://google.com/public/api/alerts',
      headerType: 'response',
    });
  });
});
