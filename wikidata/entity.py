#!/usr/bin/env python3

"""Get Wikidata dump records as a JSON stream (one JSON object per line)"""
# Modified script taken from this link: "https://www.reddit.com/r/LanguageTechnology/comments/7wc2oi/does_anyone_know_a_good_python_library_code/dtzsh2j/"

import gzip
import json
from pyArango.connection import *
from datetime import datetime

def wikidata(filename):
    with gzip.open(filename, mode='rt') as f:
        f.read(2)
        for line in f:
            try:
                yield json.loads(line.rstrip(',\n'))
            except json.decoder.JSONDecodeError:
                continue


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        description=__doc__
    )
    parser.add_argument(
        'dumpfile',
        help=(
            'a Wikidata dumpfile from: '
            'https://dumps.wikimedia.org/wikidatawiki/entities/'
            'latest-all.json.gz'
        )
    )
    args = parser.parse_args()

    conn = Connection(arangoURL="http://10.117.0.47:8529",
                      username="root", password="root")
    arangodb = conn["kgms"]
    entity = arangodb["entity"]

    for entity_dict in wikidata(args.dumpfile):
        print(entity_dict['id'])
        try:
            item =entity[entity_dict['id']]
        except Exception:
            item = entity.createDocument()
            item['_key'] = entity_dict['id']
        if 'labels' in entity_dict:
            item['labels'] = entity_dict['labels']
        if 'descriptions' in entity_dict:
            item['descriptions'] = entity_dict['descriptions']
        if 'aliases' in entity_dict:
            item['aliases'] = entity_dict['aliases']
        if 'sitelinks' in entity_dict:
            item['sitelinks'] = entity_dict['sitelinks']
        if 'lastrevid' in entity_dict:
            item['lastrevid'] = entity_dict['lastrevid']
        item['modified'] = datetime.now()
        item.save()